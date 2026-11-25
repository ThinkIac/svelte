var createBridge, requireCapabilityDependency;

createBridge = function(host) {
  var timing;
  timing = requireCapabilityDependency('@thinkiac/module-http/performance.cjs', '../../http/performance.cjs');
  return {
    measurePhase: timing.measurePhase,
    setPerformanceRoute: timing.setPerformanceRoute,
    getHub: function() {
      return host.ws.getHub();
    },
    getPackageMount: function() {
      return host.http.getPackageMount();
    },
    routeMountPath: function(pkg, route) {
      if (route.startsWith('/')) {
        return route;
      } else {
        return '/'.concat(pkg, '/').concat(route);
      }
    }
  };
};

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

module.exports = {
  createBridge: createBridge
};
