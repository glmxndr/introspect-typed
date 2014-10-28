'use strict';
import _ from 'lodash';

var typeCheckMap = new Map([
  [ Function, _.isFunction ],
  [ Boolean,  _.isBoolean ],
  [ Number,   _.isNumber ],
  [ Array,    _.isArray ],
  [ Date,     _.isDate ],
  [ RegExp,   _.isRegExp ],
  [ Object,   _.isObject ],
  [ String,   _.isString ]
]);


/**
 * Tells if the given type matches the given value.
 *
 * @param  {Any} type a type definition
 * @param  {Any} val  an optional value to be tested
 * @return {Boolean|Function} either the match result if val is given
 *                            or a function that will match any given
 *                            value with the given type
 */
var matchType = function (type, val) {
  var returnFn = (arguments.length === 1);
  if (typeCheckMap.has(type)) {
    return returnFn ? (val) => typeCheckMap.get(type)(val)
                    : typeCheckMap.get(type)(val);
  } else if (_.isString(type))  {
    return returnFn ? (val) => typeof val === type
                    : typeof val === type;
  } else if (_.isFunction(type)) {
    return returnFn ? (val) => val instanceof type
                    : val instanceof type;
  } else {
    return false;
  }
};

var matchZipped = function (zipped) {
  return matchType(...zipped);
};

/**
 * Enforces a check type on the arguments given to a function.
 * By default, if arguments given to the wrapped function do not
 * match the type definition, a TypeError is thrown.
 *
 * @param  {Array}    types an array of types describing the types of
 *                          the arguments to be passed to the function
 * @param  {Function} fn    the function to wrap the type check around
 * @return {Function}       a function wrapping the given fn argument
 *                          with an `onError` property allowing to attach
 *                          a custom event handler on TypeError.
 */
var typeChecked = function (types, fn) {

  var onErrorDefaultCb = function (error) { throw error; };
  var onErrorCb = onErrorDefaultCb;

  var checkingFn = function (...fnArgs) {
    var matchLength = () => types.length === fnArgs.length;
    var matchTypes  = () => _(types).zip(fnArgs).all(matchZipped);

    if (matchLength() && matchTypes()) {
      return fn.apply(this, fnArgs);
    } else {
      var error = new TypeError();
      error.details = {
        expected: types,
        arguments: fnArgs
      };
      onErrorCb(error, fnArgs, types);
    }
  };

  checkingFn.onError = function (fn) {
    if (!fn) {
      onErrorCb = onErrorDefaultCb;
    } else {
      onErrorCb = fn;
    }
    return checkingFn;
  };

  return checkingFn;

};

/**
 * Allows to overload a function with other behaviours depending on the
 * types of the arguments passed to the function.
 *
 * @param  {Function} defaultFn the optional default function
 * @return {Function}           a wrapping function with a `when` property
 *                              taking
 *                               - an optional overloading function name,
 *                               - an array of types and
 *                               - a function
 *                              as arguments.
 */
var overload = function (types, defaultFn) {

  if (_.isArray(types) && _.isFunction(defaultFn)) {
    defaultFn = typeChecked(types, defaultFn);
  } else if (_.isFunction(types) && _.isUndefined(defaultFn)) {
    defaultFn = types; types = undefined;
  }

  var whens = [];

  var o = { default: defaultFn };

  var destFn = function (...fnArgs) {
    var matchLength = (when) => when.types.length === fnArgs.length;
    var matchTypes  = (when) => _(when.types).zip(fnArgs).all(matchZipped);

    var done = false;
    var result;
    _.each(whens, (when) => {
      if (done) { return; }
      if (matchLength(when) && matchTypes(when)) {
        done = true;
        result = when.fn.apply(this, fnArgs.concat([o]));
      }
    });

    if (!done) {
      if (_.isFunction(defaultFn)) {
        result = defaultFn.apply(this, fnArgs);
      } else {
        result = defaultFn;
      }
    }

    return result;
  };

  destFn.when = function (name, types, fn) {
    var matchTypes  = (types) => _(types).zip(arguments).all(matchZipped);
    if (matchTypes([Array, Function])) {
      fn = types; types = name; name = null;
    }
    if (name) {
      o[name] = function (...args) {
        return fn.apply(this, args.concat([o]));
      };
    }
    whens.push({types, fn});
    return destFn;
  };

  return destFn;

};

export { matchType, typeChecked, overload };
