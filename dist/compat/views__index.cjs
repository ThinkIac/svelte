var __assign, __read, __spreadArray, __values;

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

__values = this && this.__values || function(o) {
  var i, m, s;
  s = typeof Symbol == 'function' && Symbol.iterator;
  m = s && o[s];
  i = 0;
  if (m) {
    return m.call(o);
  }
  if (o && typeof o.length == 'number') {
    return {
      next: function() {
        if (o && i >= o.length) {
          o = void 0;
        }
        return {
          value: o && o[i++],
          done: !o
        };
      }
    };
  }
  throw new TypeError((s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.'));
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

// Legacy public compatibility implementation, owned by module-svelte.
module.exports = function(require, module, exports, __dirname, __filename, kernel) {
  /** True only for the clean URL of a currently-discovered .public view. */
  /**
   * Includes widget files and the widgets directory itself. Directory removals
   * arrive from chokidar without an extension, but still invalidate the global
   * registry just like a removed .svelte/.svx widget does.
   */
  /** HMR: invalidate every page whose import graph contains the changed file. */
  /** Serial warmup keeps cold builds from competing with one another. */
  /** The package root follows the declared Index → Home priority. */
  /**
   * Precedência do modo de hot-reload de uma página, do mais específico ao mais
   * geral:
   *
   *   1. `?hmr=always|prompt|manual` na URL      (depuração pontual)
   *   2. `runtime.hotReload.mode` do package.json (o pacote se declara)
   *   3. `views.hotReload.mode` do bootstrap      (política do runtime)
   *   4. 'auto'                                   (default: janela segura e silenciosa)
   *
   * O default `auto` nunca recarrega uma interação ativa, mas converge sem UI
   * quando a página fica ociosa.
   */
  /** Resolves a clean URL page name to a private or .public source file. */
  /**
   * Toggles the Tailwind v4 CDN runtime at runtime. Combine freely with
   * setViewsTheme() — the same theme variables feed Tailwind's `@theme` block
   * once this is on.
   */
  var DEFAULT_HOT_RELOAD_MODE, SvelteEngine, __importDefault, express_1, fs_1, getEngine, getViewsGlobalData, getWidgetComponentPath, globalData, http_1, http_performance_1, isHomepageRedirect, isHotReloadMode, isRegisteredPublicView, isViewPageName, isWidgetPath, loadSvelteModule, mountPackageViews, offline_1, onViewsFileChanged, path_1, prewarmViews, privateViewFile, publicPages, publicViewFile, rebuildWidgetRegistry, renderPage, replacePublicViews, resolveEntryView, resolveHotReloadMode, resolveViewSource, setViewsGlobalData, setViewsTailwind, setViewsTheme, svelteModule, viewFiles, ws_1;
  // modules/views/index.ts — the views module (wire phase).

  // Registers /view/<pkg>/<page> for every package with a views/ dir, serves the
  // compiled client bundles at /svelte-cache, mounts the bootstrap-configured
  // index page at /, listens for .svelte changes to drive HMR, and exposes
  // setViewsTheme()/setViewsTailwind()/setViewsGlobalData() (both style-layer
  // changes push a live reload to every open page).
  // The engine belongs to the reusable Svelte module. Keep both paths because
  // source tests execute from src/ while published Lógos executes from dist/src/.
  loadSvelteModule = function() {
    return kernel.resolveModule('svelte');
  };
  isWidgetPath = function(filePath) {
    return /[\\\/]views[\\\/]widgets(?:[\\\/]|$)/i.test(filePath);
  };
  resolveHotReloadMode = function(container, pkgFolder, query) {
    var _a, _b, _c, _d, _e, _f, _g, configured, declared, pkg;
    _a = void 0;
    _b = void 0;
    _c = void 0;
    _d = void 0;
    _e = void 0;
    _f = void 0;
    _g = void 0;
    if (query == void 0) {
      query = {};
    }
    if (isHotReloadMode((query == null || query == void 0 ? void 0 : query.hmr))) {
      return query.hmr;
    }
    pkg = ((_b = (_a = container.registry) === null || _a === void 0 ? void 0 : _a.getPackage) == null || _b == void 0 ? void 0 : _b.call(_a, pkgFolder));
    declared = ((_d = (_c = pkg === null || pkg === void 0 ? void 0 : pkg.runtime) === null || _c === void 0 ? void 0 : _c.hotReload) == null || _d == void 0 ? void 0 : _d.mode);
    if (isHotReloadMode(declared)) {
      return declared;
    }
    configured = ((_g = (_f = (_e = container.config) === null || _e === void 0 ? void 0 : _e.views) === null || _f === void 0 ? void 0 : _f.hotReload) == null || _g == void 0 ? void 0 : _g.mode);
    if (isHotReloadMode(configured)) {
      return configured;
    }
    return DEFAULT_HOT_RELOAD_MODE;
  };
  getEngine = function(container) {
    var _a, _b, _c, engine;
    _a = void 0;
    _b = void 0;
    _c = void 0;
    engine = container.state('views').get('engine');
    if (!engine) {
      engine = new SvelteEngine(undefined, ((_c = (_b = (_a = container.config) === null || _a === void 0 ? void 0 : _a.views) === null || _b === void 0 ? void 0 : _b.validationIntervalMs) != null && _c != void 0 ? _c : 1000));
      container.state('views').set('engine', engine);
    }
    return engine;
  };
  globalData = function(container) {
    return container.state('views').get('globalData') || {};
  };
  isHomepageRedirect = function(value) {
    var _a, url;
    if (typeof value != 'string') {
      return false;
    }
    if (value.startsWith('/') && !value.startsWith('//')) {
      return true;
    }
    try {
      url = new URL(value);
      return url.protocol == 'https:' || url.protocol == 'http:';
    } catch (error1) {
      _a = error1;
      return false;
    }
  };
  isViewPageName = function(value) {
    // A extensão e o marcador .public pertencem ao filesystem, nunca à URL.
    return /^[A-Za-z0-9_-]+$/.test(String(value || ''));
  };
  viewFiles = function(viewsDir) {
    var _a;
    try {
      return fs_1.default.readdirSync(viewsDir);
    } catch (error1) {
      _a = error1;
      return [];
    }
  };
  privateViewFile = function(viewsDir, page) {
    var __caught, _a, _b, _c, e_1, e_1_1, extension, file;
    e_1 = void 0;
    _a = void 0;
    try {
      _b = __values(['svelte', 'svx']);
      _c = _b.next();
      while (!_c.done) {
        extension = _c.value;
        file = ''.concat(page, '.').concat(extension);
        if (fs_1.default.existsSync(path_1.default.join(viewsDir, file))) {
          return file;
        }
        _c = _b.next();
      }
    } catch (error1) {
      e_1_1 = error1;
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) {
          _a.call(_b);
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        if (e_1) {
          throw e_1.error;
        }
      }
    }
    return null;
  };
  publicViewFile = function(viewsDir, page) {
    var escaped, match;
    escaped = page.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    match = viewFiles(viewsDir).find(function(file) {
      return new RegExp('^'.concat(escaped, '\\.public\\.(svelte|svx)$'), 'i').test(file);
    });
    return match || null;
  };
  resolveViewSource = function(viewsDir, page, authenticated) {
    var file, privateFile, publicFile;
    if (authenticated == void 0) {
      authenticated = false;
    }
    if (!isViewPageName(page)) {
      return null;
    }
    privateFile = privateViewFile(viewsDir, page);
    publicFile = publicViewFile(viewsDir, page);
    file = (authenticated ? privateFile || publicFile : publicFile);
    if (!file) {
      return null;
    }
    return {
      page: page,
      file: file,
      sourcePath: path_1.default.join(viewsDir, file),
      public: file == publicFile
    };
  };
  resolveEntryView = function(viewsDir, authenticated) {
    var page;
    var file;
    var __caught, _a, _b, _c, _d, _e, _f, e_2, e_2_1, e_3, e_3_1, file, page;
    e_2 = void 0;
    _a = void 0;
    e_3 = void 0;
    _b = void 0;
    if (authenticated == void 0) {
      authenticated = false;
    }
    if (authenticated) {
      try {
        _c = __values(['Index', 'Home']);
        _d = _c.next();
        while (!_d.done) {
          page = _d.value;
          file = privateViewFile(viewsDir, page);
          if (file) {
            return {
              page: page,
              file: file,
              sourcePath: path_1.default.join(viewsDir, file),
              public: false
            };
          }
          _d = _c.next();
        }
      } catch (error1) {
        e_2_1 = error1;
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (_d && !_d.done && (_a = _c.return)) {
            _a.call(_c);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_2) {
            throw e_2.error;
          }
        }
      }
    }
    try {
      _e = __values(['Index', 'Home']);
      _f = _e.next();
      while (!_f.done) {
        page = _f.value;
        file = publicViewFile(viewsDir, page);
        if (file) {
          return {
            page: page,
            file: file,
            sourcePath: path_1.default.join(viewsDir, file),
            public: true
          };
        }
        _f = _e.next();
      }
    } catch (error1) {
      e_3_1 = error1;
      e_3 = {
        error: e_3_1
      };
    } finally {
      try {
        if (_f && !_f.done && (_b = _e.return)) {
          _b.call(_e);
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        if (e_3) {
          throw e_3.error;
        }
      }
    }
    return null;
  };
  publicPages = function(viewsDir) {
    var __caught, _a, _b, _c, e_4, e_4_1, file, match, pages;
    e_4 = void 0;
    _a = void 0;
    pages = new Set();
    try {
      _b = __values(viewFiles(viewsDir));
      _c = _b.next();
      while (!_c.done) {
        file = _c.value;
        match = file.match(/^([A-Za-z0-9_-]+)\.public\.(?:svelte|svx)$/i);
        if (match) {
          pages.add(match[1]);
        }
        _c = _b.next();
      }
    } catch (error1) {
      e_4_1 = error1;
      e_4 = {
        error: e_4_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) {
          _a.call(_b);
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        if (e_4) {
          throw e_4.error;
        }
      }
    }
    return pages;
  };
  isRegisteredPublicView = function(container, requestPath) {
    var _a, match, page, pages, pkgFolder, publicViews;
    match = String(requestPath || '').split('?')[0].match(/^\/view\/([^\/]+)(?:\/([^\/]+))?\/?$/);
    if (!match) {
      return false;
    }
    _a = __read(match, 3);
    pkgFolder = _a[1];
    page = _a[2];
    publicViews = container.state('views').get('publicViews');
    pages = (publicViews == null || publicViews == void 0 ? void 0 : publicViews.get(pkgFolder));
    if (!pages) {
      return false;
    }
    if (page) {
      return pages.has(page);
    } else {
      return Boolean(resolveEntryView(path_1.default.join(container.workspace, pkgFolder, 'views'), false));
    }
  };
  replacePublicViews = function(container, pkgFolder, viewsDir) {
    var _a, registry;
    _a = void 0;
    registry = ((_a = container.state('views').get('publicViews')) != null && _a != void 0 ? _a : new Map());
    registry.set(pkgFolder, publicPages(viewsDir));
    container.state('views').set('publicViews', registry);
  };
  renderPage = async function(container, pkgFolder, page, query, res, authenticated) {
    var componentName_1, engine, err, html, offline_2, props_1, render_1, view, viewsDir;
    if (authenticated == void 0) {
      authenticated = false;
    }
    if (false) {
      await void 0;
    }
    http_performance_1.setPerformanceRoute.call(void 0, res.req, '/view/'.concat(pkgFolder, '/:page'));
    engine = getEngine(container);
    viewsDir = path_1.default.join(container.workspace, pkgFolder, 'views');
    view = resolveViewSource(viewsDir, page, authenticated);
    if (!view) {
      return res.status(404).send('[views] "'.concat(page, '" not found or not public in package "').concat(pkgFolder, '"'));
    }
    try {
      componentName_1 = ''.concat(pkgFolder, '__').concat(page).concat((view.public ? '__public' : ''));
      props_1 = __assign(__assign({}, globalData(container)), query);
      offline_2 = offline_1.resolveOfflinePolicy.call(void 0, container, pkgFolder);
      render_1 = (await (container.bus.pipeline('views:render', {
        packageName: pkgFolder,
        viewName: page,
        source: (view.public ? 'public' : 'private'),
        clientScripts: []
      }, {
        packageName: pkgFolder,
        viewName: page,
        source: (view.public ? 'public' : 'private')
      })));
      html = (await (http_performance_1.measurePhase.call(void 0, res.req, 'view', function() {
        var _a, _b, _c;
        _a = void 0;
        _b = void 0;
        _c = void 0;
        return engine.render(view.sourcePath, componentName_1, props_1, container.workspace, {
          hotReloadMode: resolveHotReloadMode(container, pkgFolder, query),
          hotReloadBadge: ((_c = (_b = (_a = container.config) === null || _a === void 0 ? void 0 : _a.views) === null || _b === void 0 ? void 0 : _b.hotReload) === null || _c === void 0 ? void 0 : _c.badge) == true,
          offlineClient: (offline_2.mode == 'off' ? undefined : offline_1.offlineClientScript.call(void 0, offline_2)),
          clientScripts: render_1.clientScripts
        });
      })));
      res.send(html);
    } catch (error1) {
      err = error1;
      console.error('[views] '.concat(pkgFolder, '/').concat(page, ':'), err);
      res.status(500).send('<pre>[views] Error:\n'.concat(err.stack, '</pre>'));
    }
  };
  onViewsFileChanged = async function(container, payload) {
    var detail;
    var _a, _b, affected, changed, detail, engine, error, hub, isWidget, signal;
    _a = void 0;
    _b = void 0;
    if (false) {
      await void 0;
    }
    engine = getEngine(container);
    changed = path_1.default.resolve(payload.file);
    replacePublicViews(container, payload.pkg, path_1.default.join(container.workspace, payload.pkg, 'views'));
    // Widgets folder changed → registry must be rebuilt (affects every page).
    isWidget = isWidgetPath(changed);
    if (isWidget) {
      engine.buildWidgetRegistry(container.workspace);
    }
    // A remoção de uma pasta não pertence ao grafo anterior de nenhuma página.
    // O registry, porém, pertence ao grafo de toda página que usa <Widget>.
    // Portanto sua reconstrução é a mudança que essas páginas precisam receber.
    affected = __spreadArray([], __read(new Set(__spreadArray(__spreadArray([], __read(engine.affectedComponents(changed)), false), __read((isWidget ? engine.affectedComponents(engine.widgetRegistryPath) : [])), false))), false);
    try {
      // A alteração só é publicada depois de compilar e renderizar SSR sem DOM.
      // Assim um `window` fora de onMount mantém a versão saudável em serviço.
      await engine.validateComponents(affected, container.workspace);
      ((_b = (_a = container.state('views')).delete) == null || _b == void 0 ? void 0 : _b.call(_a, 'validation:'.concat(changed)));
    } catch (error1) {
      error = error1;
      detail = (error == null || error == void 0 ? undefined : error.stack) || (error == null || error == void 0 ? undefined : error.message) || String(error);
      container.log('[views:hmr] validation failed for '.concat(path_1.default.basename(changed), ': ').concat(detail));
      await container.bus.emit('package:reload_failed', {
        pkg: payload.pkg,
        files: [changed],
        checks: [
          {
            name: 'views:ssr',
            ok: false,
            detail: detail
          }
        ],
        error: detail
      });
      container.state('views').set('validation:'.concat(changed), detail);
      return;
    }
    hub = ws_1.getHub.call(void 0, container);
    // O payload carrega pacote e arquivos: o cliente só recarrega sozinho no modo
    // `always`; nos outros ele precisa saber O QUE mudou para mostrar ao usuário.
    signal = {
      pkg: payload.pkg,
      files: [path_1.default.basename(changed)]
    };
    if (affected.length) {
      // O registry entra no manifest apenas de páginas que usam <Widget>; até
      // widgets compartilhados podem, portanto, atualizar só seus consumidores.
      hub.broadcast(__assign({
        type: 'views:hmr',
        components: affected,
        all: false
      }, signal));
      container.log('[views:hmr] '.concat(path_1.default.basename(changed), ' → ').concat(affected.join(', ')));
    }
  };
  // ── Public helpers (exported from src/index.ts) ─────────────────────────────
  setViewsGlobalData = function(container, data) {
    container.state('views').set('globalData', (data && typeof data == 'object' ? data : {}));
  };
  getViewsGlobalData = function(container) {
    return globalData(container);
  };
  setViewsTheme = function(container, theme) {
    getEngine(container).setTheme(theme);
    // Theme lives in each rendered page — push a live reload everywhere.
    ws_1.getHub.call(void 0, container).broadcast({
      type: 'views:hmr',
      components: [],
      all: true
    });
  };
  setViewsTailwind = function(container, enabled) {
    getEngine(container).setTailwind(enabled);
    ws_1.getHub.call(void 0, container).broadcast({
      type: 'views:hmr',
      components: [],
      all: true
    });
  };
  rebuildWidgetRegistry = function(container) {
    getEngine(container).buildWidgetRegistry(container.workspace);
    ws_1.getHub.call(void 0, container).broadcast({
      type: 'views:hmr',
      components: [],
      all: true
    });
  };
  getWidgetComponentPath = function(container) {
    return getEngine(container).widgetComponentPath;
  };
  prewarmViews = async function(container) {
    var __caught, _a, _b, _c, _d, _e, _f, _g, _h, e_5, e_5_1, error, failed, target, view, viewsDir;
    e_5 = void 0;
    _a = void 0;
    _b = void 0;
    _c = void 0;
    _d = void 0;
    _e = void 0;
    _f = void 0;
    if (false) {
      await void 0;
    }
    failed = [];
    if (((_c = (_b = container.config) === null || _b === void 0 ? void 0 : _b.views) === null || _c === void 0 ? void 0 : _c.enabled) == false) {
      return {
        ready: true,
        failed: failed
      };
    }
    try {
      _g = __values(((_f = (_e = (_d = container.config) === null || _d === void 0 ? void 0 : _d.views) === null || _e === void 0 ? void 0 : _e.warmup) != null && _f != void 0 ? _f : []));
      _h = _g.next();
      while (!_h.done) {
        target = _h.value;
        viewsDir = path_1.default.join(container.workspace, target.package, 'views');
        if (!fs_1.default.existsSync(viewsDir)) {
          _h = _g.next();
          continue;
        }
        view = resolveViewSource(viewsDir, target.page, true);
        if (!view) {
          failed.push(''.concat(target.package, '/').concat(target.page));
          _h = _g.next();
          continue;
        }
        try {
          await getEngine(container).prewarm(view.sourcePath, ''.concat(target.package, '__').concat(target.page).concat((view.public ? '__public' : '')), container.workspace);
        } catch (error1) {
          error = error1;
          failed.push(''.concat(target.package, '/').concat(target.page));
          container.log('[views:warmup] '.concat(target.package, '/').concat(target.page, ': ').concat(error.message));
        }
        _h = _g.next();
      }
    } catch (error1) {
      e_5_1 = error1;
      e_5 = {
        error: e_5_1
      };
    } finally {
      try {
        if (_h && !_h.done && (_a = _g.return)) {
          _a.call(_g);
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        if (e_5) {
          throw e_5.error;
        }
      }
    }
    return {
      ready: failed.length == 0,
      failed: failed
    };
  };
  'use strict';
  __importDefault = this && this.__importDefault || function(mod) {
    if (mod && mod.__esModule) {
      return mod;
    } else {
      return {
        'default': mod
      };
    }
  };
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.viewsModule = void 0;
  exports.isWidgetPath = isWidgetPath;
  exports.resolveHotReloadMode = resolveHotReloadMode;
  exports.getEngine = getEngine;
  exports.resolveViewSource = resolveViewSource;
  exports.resolveEntryView = resolveEntryView;
  exports.isRegisteredPublicView = isRegisteredPublicView;
  exports.setViewsGlobalData = setViewsGlobalData;
  exports.getViewsGlobalData = getViewsGlobalData;
  exports.setViewsTheme = setViewsTheme;
  exports.setViewsTailwind = setViewsTailwind;
  exports.rebuildWidgetRegistry = rebuildWidgetRegistry;
  exports.getWidgetComponentPath = getWidgetComponentPath;
  exports.prewarmViews = prewarmViews;
  fs_1 = __importDefault(require('fs'));
  http_performance_1 = require('../../kernel/http-performance');
  path_1 = __importDefault(require('path'));
  express_1 = __importDefault(require('express'));
  ws_1 = require('../ws');
  http_1 = require('../http');
  offline_1 = require('./offline');
  DEFAULT_HOT_RELOAD_MODE = 'auto';
  svelteModule = loadSvelteModule();
  SvelteEngine = svelteModule.SvelteEngine;
  mountPackageViews = svelteModule.mountPackageViews;
  isHotReloadMode = svelteModule.isHotReloadMode;
  exports.viewsModule = {
    name: 'views',
    phase: 'wire',
    after: ['http', 'ws'],
    install: function(container) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, engine, index;
      _a = void 0;
      _b = void 0;
      _c = void 0;
      _d = void 0;
      _e = void 0;
      _f = void 0;
      _g = void 0;
      _h = void 0;
      _j = void 0;
      _k = void 0;
      _l = void 0;
      _m = void 0;
      _o = void 0;
      _p = void 0;
      _q = void 0;
      _r = void 0;
      if (((_b = (_a = container.config) === null || _a === void 0 ? void 0 : _a.views) === null || _b === void 0 ? void 0 : _b.enabled) == false) {
        return;
      }
      engine = getEngine(container);
      container.state('views').set('globalData', ((_d = (_c = container.config) === null || _c === void 0 ? void 0 : _c.views) == null || _d == void 0 ? void 0 : _d.globalData) || {});
      engine.setTheme(((_f = (_e = container.config) === null || _e === void 0 ? void 0 : _e.views) == null || _f == void 0 ? void 0 : _f.theme) || {}, ((_h = (_g = container.config) === null || _g === void 0 ? void 0 : _g.views) == null || _h == void 0 ? void 0 : _h.bootstrap5));
      engine.setTailwind(((_l = (_k = (_j = container.config) === null || _j === void 0 ? void 0 : _j.views) === null || _k === void 0 ? void 0 : _k.tailwind) != null && _l != void 0 ? _l : false), ((_p = (_o = (_m = container.config) === null || _m === void 0 ? void 0 : _m.views) === null || _o === void 0 ? void 0 : _o.precompileCss) != null && _p != void 0 ? _p : false));
      container.bus.on('package:wiring', (function(payload) {
        return mountPackageViews(container, payload.pkg, {
          getEngine: getEngine,
          getPackageMount: http_1.getPackageMount,
          replacePublicViews: replacePublicViews,
          resolveEntryView: resolveEntryView,
          renderPage: renderPage,
          staticAssets: express_1.default.static
        });
      }), {
        priority: 70
      });
      container.bus.on('views:file_changed', (function(payload) {
        return onViewsFileChanged(container, payload);
      }), {
        priority: 50
      });
      // Política offline computada — é o que o Service Worker precisa e não pode
      // ler (ele não enxerga JSDoc nem package.json).
      container.app.get('/_logos/offline', function(_req, res) {
        res.set('Cache-Control', 'no-store').json(offline_1.buildOfflineManifest.call(void 0, container));
      });
      // Servido na RAIZ porque o escopo de um Service Worker é limitado pelo
      // caminho de onde ele é servido: em /logos-sw.js o escopo é `/` e cobre
      // /view/<pkg>/<page> e as rotas dos pacotes. `no-cache` porque o browser
      // precisa revalidar para enxergar uma política nova.
      container.app.get('/logos-sw.js', function(_req, res) {
        res.set('Content-Type', 'application/javascript').set('Cache-Control', 'no-cache').set('Service-Worker-Allowed', '/').send(offline_1.serviceWorkerScript.call(void 0, offline_1.buildOfflineManifest.call(void 0, container)));
      });
      // bootstrap({ views: { index } }) — serve a page (or redirect) at /
      index = ((_r = (_q = container.config) === null || _q === void 0 ? void 0 : _q.views) == null || _r == void 0 ? void 0 : _r.index);
      if (index) {
        container.app.get('/', async function(req, res) {
          var resolved, target;
          if (false) {
            await void 0;
          }
          // Packages can claim the homepage through the closed `views:index`
          // pipeline.  The configured index remains the default and handlers
          // only affect this request when they explicitly return `redirect`.
          resolved = (await (container.bus.pipeline('views:index', {
            index: index,
            req: req
          })));
          if (isHomepageRedirect((resolved == null || resolved == void 0 ? void 0 : resolved.redirect))) {
            return res.redirect(resolved.redirect);
          }
          target = (resolved == null || resolved == void 0 ? void 0 : resolved.index) || index;
          if (typeof target == 'string') {
            return res.redirect(target);
          }
          return renderPage(container, target.package, target.page, __assign({}, req.query), res);
        });
        container.log('[views] index mounted at / → '.concat((typeof index == 'string' ? index : ''.concat(index.package, '/').concat(index.page))));
      }
    }
  };
};
