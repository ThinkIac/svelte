var __assign, __read, __spreadArray, requireCapabilityDependency;

requireCapabilityDependency = function(name, local) {
  var entry, error;
  entry = void 0;
  try {
    entry = require.resolve(name);
  } catch (error1) {
    error = error1;
    if (error.code != 'MODULE_NOT_FOUND') {
      throw error;
    }
    entry = require.resolve(local);
  }
  return require(entry);
};

'use strict';

__assign = this && this.__assign || function() {
  __assign = Object.assign || function(t) {
    var i, n, p, s;
    s = void 0;
    i = 1;
    n = arguments.length;
    while (i < n) {
      s = arguments[i];
      for (p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) {
          t[p] = s[p];
        }
      }
      i++;
    }
    return t;
  };
  return __assign.apply(this, arguments);
};

__read = this && this.__read || function(o, n) {
  var __caught, ar, e, error, i, m, r;
  m = typeof Symbol == 'function' && o[Symbol.iterator];
  if (!m) {
    return o;
  }
  i = m.call(o);
  r = void 0;
  ar = [];
  e = void 0;
  try {
    while ((n == void 0 || n-- > 0) && !(r = i.next()).done) {
      ar.push(r.value);
    }
  } catch (error1) {
    error = error1;
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i['return'])) {
        m.call(i);
      }
    } catch (error1) {
      __caught = error1;
      throw __caught;
    } finally {
      if (e) {
        throw e.error;
      }
    }
  }
  return ar;
};

__spreadArray = this && this.__spreadArray || function(to, from, pack) {
  var ar, i, l;
  if (pack || arguments.length == 2) {
    i = 0;
    l = from.length;
    ar = void 0;
    while (i < l) {
      if (ar || !(i in from)) {
        if (!ar) {
          ar = Array.prototype.slice.call(from, 0, i);
        }
        ar[i] = from[i];
      }
      i++;
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};

// The public module boundary. Consumers intentionally do not depend on the
// Logos source-tree layout or on its compiled dist path.
module.exports = __assign(__assign(__assign(__assign(__assign(__assign(__assign({}, require('./lib/engine.cjs')), require('./lib/routes.cjs')), require('./lib/assets.cjs')), require('./lib/file-digests.cjs')), require('./lib/tailwind-styles.cjs')), require('./runtime/offline.cjs')), {
  provideViews: require('./runtime-module.cjs').provideViews
});

// Compatibility factories resolve their SDK from their own dependency graph.
module.exports.createHost = function() {
  var _a, _i, args;
  _a = void 0;
  args = [];
  _i = 0;
  while (_i < arguments.length) {
    args[_i] = arguments[_i];
    _i++;
  }
  return (_a = requireCapabilityDependency('@thinkiac/module-runtime-compat', '../runtime-compat')).createHost.apply(_a, __spreadArray([], __read(args), false));
};
