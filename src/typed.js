'use strict';
import _ from 'lodash';


var Typed = function () {

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

  // Matches any value
  var Any = function () { return Any; };

  // Allows to type check against several types...
  var Either = function (...args) {
    if (!(this instanceof Either)) {
      return new Either(...args);
    }
    this.types = args;
  };

  // Matches against a predicate function, instead of a type
  var Matcher = function (p) {
    if (!(this instanceof Matcher)) {
      return new Matcher(p);
    }
    this.predicate = (v) => {
      try { return !!p(v); }
      catch(e) { return false; }
    };
  };

  var typeMatchCases = [{
    case:  (type) => typeCheckMap.has(type),
    match: (type) => ((val) => typeCheckMap.get(type)(val))
  },{
    case:  (type) => type === Any,
    match: ()     => (() => true)
  },{
    case:  (type) => type instanceof Either,
    match: (type) => ((val) => (type.types).some( t => matchType(t, val) ))
  },{
    case:  (type) => type instanceof Matcher,
    match: (type) => type.predicate
  },{
    case:  (type) => _.isString(type),
    match: (type) => ((val) => typeof val === type)
  },{
    case:  (type) => _.isFunction(type),
    match: (type) => ((val) => val instanceof type)
  },{
    case:  (type) => type === null || type === undefined,
    match: (type) => ((val) => val === type)
  }];

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

    var matcherFn = typeMatchCases.reduce((found, tmc) => {
      return found ? found : tmc.case(type) ? tmc.match(type, val) : null;
    }, null);

    if (matcherFn === null) { return returnFn ? () => false : false; }
    else { return returnFn ? matcherFn : matcherFn(val); }
  };

  var typeMatchCaseMatcher = Matcher((o) =>
    _.isObject(o) &&
    _.isFunction(o.case) &&
    _.isFunction(o.match)
  );

  matchType.addTypeMatchCase = function (obj) {
    if (matchType(typeMatchCaseMatcher, obj)) {
      typeMatchCases.push(obj);
    }
  };

  var matchZipped = (zipped) => matchType(...zipped);
  var matchTypes  = (ts, vs) => _(ts).zip(vs).all(matchZipped);
  var matchLength = (ts, vs) => ts.length === vs.length;
  var checkTypes  = (ts, vs) => matchLength(ts, vs) && matchTypes(ts, vs);

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
      if (checkTypes(types, fnArgs)) {
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
      var done = false;
      var result;
      _.each(whens, (when) => {
        if (done) { return; }
        if (checkTypes(when.types, fnArgs)) {
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
      if (matchTypes([Array, Function], arguments)) {
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

  return { Any, Either, Matcher, matchType, typeChecked, overload };

};

var instance = Typed();

for (var key in instance) {
  Typed[key] = instance[key];
}

export default Typed;
