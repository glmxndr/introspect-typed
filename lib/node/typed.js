"use strict";
Object.defineProperties(exports, {
  matchType: {get: function() {
      return matchType;
    }},
  typeChecked: {get: function() {
      return typeChecked;
    }},
  overload: {get: function() {
      return overload;
    }},
  __esModule: {value: true}
});
var $__lodash__;
'use strict';
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var typeCheckMap = new Map([[Function, _.isFunction], [Boolean, _.isBoolean], [Number, _.isNumber], [Array, _.isArray], [Date, _.isDate], [RegExp, _.isRegExp], [Object, _.isObject], [String, _.isString]]);
var matchType = function(type, val) {
  var returnFn = (arguments.length === 1);
  if (typeCheckMap.has(type)) {
    return returnFn ? (function(val) {
      return typeCheckMap.get(type)(val);
    }) : typeCheckMap.get(type)(val);
  } else if (_.isString(type)) {
    return returnFn ? (function(val) {
      return typeof val === type;
    }) : typeof val === type;
  } else if (_.isFunction(type)) {
    return returnFn ? (function(val) {
      return val instanceof type;
    }) : val instanceof type;
  } else {
    return false;
  }
};
var matchZipped = function(zipped) {
  return matchType.apply(null, $traceurRuntime.spread(zipped));
};
var typeChecked = function(types, fn) {
  var onErrorDefaultCb = function(error) {
    throw error;
  };
  var onErrorCb = onErrorDefaultCb;
  var checkingFn = function() {
    for (var fnArgs = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      fnArgs[$__2] = arguments[$__2];
    var matchLength = (function() {
      return types.length === fnArgs.length;
    });
    var matchTypes = (function() {
      return _(types).zip(fnArgs).all(matchZipped);
    });
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
  checkingFn.onError = function(fn) {
    if (!fn) {
      onErrorCb = onErrorDefaultCb;
    } else {
      onErrorCb = fn;
    }
    return checkingFn;
  };
  return checkingFn;
};
var overload = function(types, defaultFn) {
  if (_.isArray(types) && _.isFunction(defaultFn)) {
    defaultFn = typeChecked(types, defaultFn);
  } else if (_.isFunction(types) && _.isUndefined(defaultFn)) {
    defaultFn = types;
    types = undefined;
  }
  var whens = [];
  var o = {default: defaultFn};
  var destFn = function() {
    for (var fnArgs = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      fnArgs[$__2] = arguments[$__2];
    var $__1 = this;
    var matchLength = (function(when) {
      return when.types.length === fnArgs.length;
    });
    var matchTypes = (function(when) {
      return _(when.types).zip(fnArgs).all(matchZipped);
    });
    var done = false;
    var result;
    _.each(whens, (function(when) {
      if (done) {
        return;
      }
      if (matchLength(when) && matchTypes(when)) {
        done = true;
        result = when.fn.apply($__1, fnArgs.concat([o]));
      }
    }));
    if (!done) {
      if (_.isFunction(defaultFn)) {
        result = defaultFn.apply(this, fnArgs);
      } else {
        result = defaultFn;
      }
    }
    return result;
  };
  destFn.when = function(name, types, fn) {
    var $__1 = arguments;
    var matchTypes = (function(types) {
      return _(types).zip($__1).all(matchZipped);
    });
    if (matchTypes([Array, Function])) {
      fn = types;
      types = name;
      name = null;
    }
    if (name) {
      o[name] = function() {
        for (var args = [],
            $__3 = 0; $__3 < arguments.length; $__3++)
          args[$__3] = arguments[$__3];
        return fn.apply(this, args.concat([o]));
      };
    }
    whens.push({
      types: types,
      fn: fn
    });
    return destFn;
  };
  return destFn;
};
;
