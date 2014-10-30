"use strict";
Object.defineProperties(exports, {
  Any: {get: function() {
      return Any;
    }},
  Either: {get: function() {
      return Either;
    }},
  Matcher: {get: function() {
      return Matcher;
    }},
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
var Any = function() {
  return Any;
};
var Either = function() {
  for (var args = [],
      $__2 = 0; $__2 < arguments.length; $__2++)
    args[$__2] = arguments[$__2];
  if (!(this instanceof Either)) {
    return new (Function.prototype.bind.apply(Either, $traceurRuntime.spread([null], args)))();
  }
  this.types = args;
};
var Matcher = function(p) {
  if (!(this instanceof Matcher)) {
    return new Matcher(p);
  }
  this.predicate = (function(v) {
    try {
      return !!p(v);
    } catch (e) {
      return false;
    }
  });
};
var matchType = function(type, val) {
  var returnFn = (arguments.length === 1);
  var predicate;
  if (typeCheckMap.has(type)) {
    return returnFn ? (function(val) {
      return typeCheckMap.get(type)(val);
    }) : typeCheckMap.get(type)(val);
  } else if (type === Any) {
    return returnFn ? (function(val) {
      return true;
    }) : true;
  } else if (type instanceof Either) {
    predicate = (function(val) {
      return _(type.types).some((function(t) {
        return matchType(t, val);
      }));
    });
    return returnFn ? predicate : predicate(val);
  } else if (type instanceof Matcher) {
    predicate = type.predicate;
    return returnFn ? predicate : predicate(val);
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
var matchZipped = (function(zipped) {
  return matchType.apply(null, $traceurRuntime.spread(zipped));
});
var matchTypes = (function(ts, vs) {
  return _(ts).zip(vs).all(matchZipped);
});
var matchLength = (function(ts, vs) {
  return ts.length === vs.length;
});
var checkTypes = (function(ts, vs) {
  return matchLength(ts, vs) && matchTypes(ts, vs);
});
var typeChecked = function(types, fn) {
  var onErrorDefaultCb = function(error) {
    throw error;
  };
  var onErrorCb = onErrorDefaultCb;
  var checkingFn = function() {
    for (var fnArgs = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      fnArgs[$__3] = arguments[$__3];
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
        $__3 = 0; $__3 < arguments.length; $__3++)
      fnArgs[$__3] = arguments[$__3];
    var $__1 = this;
    var done = false;
    var result;
    _.each(whens, (function(when) {
      if (done) {
        return;
      }
      if (checkTypes(when.types, fnArgs)) {
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
    if (matchTypes([Array, Function], arguments)) {
      fn = types;
      types = name;
      name = null;
    }
    if (name) {
      o[name] = function() {
        for (var args = [],
            $__4 = 0; $__4 < arguments.length; $__4++)
          args[$__4] = arguments[$__4];
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
