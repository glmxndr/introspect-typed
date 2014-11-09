"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__lodash__;
'use strict';
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var Typed = function() {
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
  var typeMatchCases = [{
    case: (function(type) {
      return typeCheckMap.has(type);
    }),
    match: (function(type, val) {
      return ((function(val) {
        return typeCheckMap.get(type)(val);
      }));
    })
  }, {
    case: (function(type) {
      return type === Any;
    }),
    match: (function() {
      return ((function() {
        return true;
      }));
    })
  }, {
    case: (function(type) {
      return type instanceof Either;
    }),
    match: (function(type, val) {
      return ((function(val) {
        return (type.types).some((function(t) {
          return matchType(t, val);
        }));
      }));
    })
  }, {
    case: (function(type) {
      return type instanceof Matcher;
    }),
    match: (function(type) {
      return type.predicate;
    })
  }, {
    case: (function(type) {
      return _.isString(type);
    }),
    match: (function(type, val) {
      return ((function(val) {
        return typeof val === type;
      }));
    })
  }, {
    case: (function(type) {
      return _.isFunction(type);
    }),
    match: (function(type, val) {
      return ((function(val) {
        return val instanceof type;
      }));
    })
  }, {
    case: (function(type) {
      return type === null || type === undefined;
    }),
    match: (function(type, val) {
      return ((function(val) {
        return val === type;
      }));
    })
  }];
  var matchType = function(type, val) {
    var returnFn = (arguments.length === 1);
    var matcherFn = typeMatchCases.reduce((function(found, tmc) {
      return found ? found : tmc.case(type) ? tmc.match(type, val) : null;
    }), null);
    if (matcherFn === null) {
      return returnFn ? (function() {
        return false;
      }) : false;
    } else {
      return returnFn ? matcherFn : matcherFn(val);
    }
  };
  var typeMatchCaseMatcher = Matcher((function(o) {
    return _.isObject(o) && _.isFunction(o.case) && _.isFunction(o.match);
  }));
  matchType.addTypeMatchCase = function(obj) {
    if (matchType(typeMatchCaseMatcher, obj)) {
      typeMatchCases.push(obj);
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
  return {
    Any: Any,
    Either: Either,
    Matcher: Matcher,
    matchType: matchType,
    typeChecked: typeChecked,
    overload: overload
  };
};
var instance = Typed();
for (var key in instance) {
  Typed[key] = instance[key];
}
var $__default = Typed;
