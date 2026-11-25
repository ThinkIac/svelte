var createBridge, createRuntime, facade, offline, provideViews;

({createBridge} = require('./runtime/views-bridge.cjs'));

({createRuntime} = require('./runtime/views-runtime.cjs'));

offline = require('./runtime/offline.cjs');

facade = function(host) {
  var container;
  container = {
    workspace: host.workspace(),
    config: host.config(),
    state: host.state,
    registry: host.registry,
    log: host.log,
    bus: {
      on: host.on,
      emit: host.emit,
      pipeline: host.pipeline
    }
  };
  // HTTP installs after discovery; resolve its application when it is used.
  Object.defineProperty(container, 'app', {
    enumerable: true,
    get: function() {
      return host.http.app();
    }
  });
  return container;
};

provideViews = function(host) {
  /*
  @register module views
  @accepts view
  @context capability
  */
  var container, legacy;
  legacy = createRuntime(createBridge(host));
  container = facade(host);
  return {
    name: 'views',
    phase: 'wire',
    requires: ['http'],
    after: ['ws'],
    prepare: async function() {
      return host.state('views').set('readiness', (await legacy.prewarmViews(container)));
    },
    api: {
      isRegisteredPublicView: function(path) {
        return legacy.isRegisteredPublicView(container, path);
      },
      prewarm: function() {
        return legacy.prewarmViews(container);
      },
      setGlobalData: function(data) {
        return legacy.setViewsGlobalData(container, data);
      },
      getGlobalData: function() {
        return legacy.getViewsGlobalData(container);
      },
      setTheme: function(theme) {
        return legacy.setViewsTheme(container, theme);
      },
      setTailwind: function(enabled) {
        return legacy.setViewsTailwind(container, enabled);
      },
      rebuildWidgets: function() {
        return legacy.rebuildWidgetRegistry(container);
      },
      resolveHotReloadMode: function(pkg, query) {
        return legacy.resolveHotReloadMode(container, pkg, query);
      }
    },
    install: function() {
      legacy.viewsModule.install(container);
      host.on('views:offline_routes', function({pkg, routes}) {
        return offline.recordOfflineRoutes(container, pkg, routes);
      }, {
        priority: 30
      });
    }
  };
};

module.exports = {
  provideViews,
  createRuntimeModule: provideViews
};
