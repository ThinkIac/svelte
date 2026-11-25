
/**
 * Browser contract for optional file-picker providers.
 *
 * Lógos never imports a package-specific picker. Instead every native file
 * input announces a cancellable request. An installed provider may cancel it
 * and populate the original input; without a provider the browser's picker is
 * left completely untouched. File Manager is one such provider.
 */
/**
 * O cliente de hot-reload injetado em toda página renderizada.
 *
 * Em qualquer modo ele expõe `window.LogosHMR` ({ mode, pending, reload() })
 * e dispara `logos:views-changed` no documento, para que a aplicação possa
 * desenhar a própria UI de "há uma atualização" em vez da barra embutida.
 */
var CACHE_DIR, SvelteEngine, TAILWIND_CDN_URL, VIEW_MANIFEST_FORMAT, __assign, __importDefault, __read, __spreadArray, __values, assets_1, crypto_1, filePickerProtocolClientScript, file_digests_1, fs_1, hmrClientScript, isHotReloadMode, path_1, requireDep, tailwind_styles_1, utils_1;

requireDep = function(name) {
  var err;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(name);
  } catch (error1) {
    err = error1;
    if (err.code == 'MODULE_NOT_FOUND') {
      throw new Error('[views] "'.concat(name, '" not installed. Run: npm install svelte esbuild esbuild-svelte'));
    }
    throw err;
  }
};

isHotReloadMode = function(value) {
  return exports.HOT_RELOAD_MODES.indexOf(value) != -1;
};

hmrClientScript = function(componentName, options) {
  return '<script>\n(function () {\n  var component = '.concat(JSON.stringify(componentName), ';\n  var mode = ').concat(JSON.stringify(options.mode), ';\n  var badge = ').concat((options.badge ? 'true' : 'false'), ';\n  try {\n    var override = new URLSearchParams(location.search).get(\'hmr\');\n    if (override === \'always\' || override === \'auto\' || override === \'prompt\' || override === \'manual\') mode = override;\n  } catch (_) {}\n\n  var holds = {};\n  var dirty = false;\n  var lastActivity = Date.now();\n  var timer = null;\n  var AUTO_IDLE_MS = 1500;\n  var AUTO_MAX_MS = 5000;\n  var pendingSince = 0;\n  function noteActivity() { lastActivity = Date.now(); if (api.pending) scheduleAutoApply(); }\n  function hasFocusedEditor() {\n    var el = document.activeElement;\n    return !!el && (el.tagName === \'INPUT\' || el.tagName === \'TEXTAREA\' || el.tagName === \'SELECT\' || el.isContentEditable);\n  }\n  function isSafe() {\n    return document.visibilityState === \'visible\' && !dirty && !hasFocusedEditor() && Object.keys(holds).length === 0;\n  }\n  function restoreableState() {\n    return { scrollX: window.scrollX || 0, scrollY: window.scrollY || 0 };\n  }\n  function reload() {\n    try { sessionStorage.setItem(\'__logos_hmr_restore__\', JSON.stringify(restoreableState())); } catch (_) {}\n    location.reload();\n  }\n  var api = {\n    mode: mode, pending: false, changes: [], reload: reload,\n    hold: function (reason) { holds[String(reason || \'anonymous\')] = true; scheduleAutoApply(); },\n    release: function (reason) { delete holds[String(reason || \'anonymous\')]; scheduleAutoApply(); },\n    markDirty: function () { dirty = true; scheduleAutoApply(); },\n    clearDirty: function () { dirty = false; scheduleAutoApply(); },\n    isHeld: function () { return Object.keys(holds).length > 0; },\n  };\n  window.LogosHMR = api;\n\n  try {\n    var saved = JSON.parse(sessionStorage.getItem(\'__logos_hmr_restore__\') || \'null\');\n    sessionStorage.removeItem(\'__logos_hmr_restore__\');\n    if (saved) window.addEventListener(\'load\', function () { window.scrollTo(saved.scrollX || 0, saved.scrollY || 0); }, { once: true });\n  } catch (_) {}\n\n  function reloadIframe() {\n    // Uma view dentro de iframe é uma fronteira natural: só ela perde estado.\n    if (!isEmbedded()) return false;\n    try { window.location.reload(); return true; } catch (_) { return false; }\n  }\n  function scheduleAutoApply() {\n    if (mode !== \'auto\' || !api.pending) return;\n    if (timer) clearTimeout(timer);\n    var elapsed = Date.now() - pendingSince;\n    var wait = Math.max(0, Math.min(AUTO_IDLE_MS, AUTO_MAX_MS - elapsed));\n    timer = setTimeout(function attempt() {\n      if (!api.pending) return;\n      if (reloadIframe()) return;\n      if (isSafe() && (Date.now() - lastActivity >= AUTO_IDLE_MS || Date.now() - pendingSince >= AUTO_MAX_MS)) reload();\n      else scheduleAutoApply();\n    }, wait || 50);\n  }\n  [\'pointerdown\', \'keydown\', \'input\', \'focusin\', \'change\'].forEach(function (event) { document.addEventListener(event, noteActivity, true); });\n  document.addEventListener(\'visibilitychange\', scheduleAutoApply);\n\n  function isEmbedded() {\n    // Dentro de iframe o badge fica por conta da página top-level — que\n    // também recebe este script — para a atualização aparecer uma vez só.\n    try { return window.self !== window.top; } catch (_) { return true; }\n  }\n\n  function showBadge() {\n    if (!badge || isEmbedded() || document.getElementById(\'logos-hmr-badge\')) return;\n    var el = document.createElement(\'button\');\n    el.id = \'logos-hmr-badge\';\n    el.type = \'button\';\n    el.textContent = \'\\u21bb Update available\';\n    el.setAttribute(\'style\', [\n      \'position:fixed\', \'right:16px\', \'bottom:16px\', \'z-index:2147483647\',\n      \'padding:10px 16px\', \'border:0\', \'border-radius:999px\',\n      \'font:600 13px/1 system-ui,sans-serif\', \'color:#fff\', \'background:#2563eb\',\n      \'box-shadow:0 4px 16px rgba(0,0,0,.28)\', \'cursor:pointer\',\n    ].join(\';\'));\n    el.onclick = function () { api.reload(); };\n    (document.body || document.documentElement).appendChild(el);\n  }\n\n  function onChanged(msg) {\n    api.pending = true;\n    pendingSince = pendingSince || Date.now();\n    if (msg && msg.files) api.changes = api.changes.concat(msg.files);\n    try {\n      document.dispatchEvent(new CustomEvent(\'logos:views-changed\', {\n        detail: { component: component, mode: mode, pkg: msg && msg.pkg, files: (msg && msg.files) || [] },\n      }));\n    } catch (_) {}\n    if (mode === \'always\') return api.reload();\n    if (mode === \'auto\') return scheduleAutoApply();\n    if (mode === \'prompt\') showBadge();\n  }\n\n  function connect() {\n    var proto = location.protocol === \'https:\' ? \'wss://\' : \'ws://\';\n    var ws = new WebSocket(proto + location.host + \'/ws?session=views-hmr\');\n    ws.onmessage = function (e) {\n      try {\n        var msg = JSON.parse(e.data);\n        if (msg.type === \'views:hmr\' &&\n            (msg.all || (msg.components || []).indexOf(component) !== -1)) {\n          onChanged(msg);\n        }\n      } catch (_) {}\n    };\n    ws.onclose = function () {\n      // Sem rede não adianta reabrir de 1,5 em 1,5 segundo: era reconexão\n      // infinita queimando bateria exatamente no cenário offline. Espera o\n      // evento \'online\' em vez de insistir no vazio.\n      if (navigator.onLine === false) {\n        window.addEventListener(\'online\', function once() {\n          window.removeEventListener(\'online\', once);\n          connect();\n        });\n        return;\n      }\n      setTimeout(connect, 1500);\n    };\n  }\n  connect();\n})();\n</script>');
};

filePickerProtocolClientScript = function() {
  return '<script>\n(function () {\n  if (window.LogosFilePicker) return;\n  var EVENT = \'logos:file-picker:request\';\n  function isFileInput(node) {\n    return node && node.nodeType === 1 && node.tagName === \'INPUT\' &&\n      String(node.type || \'\').toLowerCase() === \'file\';\n  }\n  function request(input, trigger) {\n    if (!isFileInput(input) || input.disabled || input.readOnly ||\n        input.hasAttribute(\'data-logos-native-file-picker\')) return false;\n    var detail = {\n      input: input,\n      accept: input.accept || \'\',\n      multiple: !!input.multiple,\n      root: input.getAttribute(\'data-logos-file-root\') || undefined,\n      trigger: trigger || \'api\',\n    };\n    var event = new CustomEvent(EVENT, { bubbles: true, cancelable: true, detail: detail });\n    input.dispatchEvent(event);\n    return event.defaultPrevented;\n  }\n  window.LogosFilePicker = { event: EVENT, request: request };\n  document.addEventListener(\'click\', function (event) {\n    var input = event.target;\n    if (!isFileInput(input)) return;\n    if (request(input, \'click\')) event.preventDefault();\n  }, true);\n})();\n</script>';
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

exports.SvelteEngine = exports.HOT_RELOAD_MODES = void 0;

exports.isHotReloadMode = isHotReloadMode;

exports.hmrClientScript = hmrClientScript;

exports.filePickerProtocolClientScript = filePickerProtocolClientScript;

tailwind_styles_1 = require('./tailwind-styles.cjs');

assets_1 = require('./assets.cjs');

file_digests_1 = require('./file-digests.cjs');

// modules/views/engine.ts — Svelte SSR + hydration engine, v3.

// v3 changes over v2: bundler swapped from Rollup to esbuild. Cold builds
// (first request for a page after a source change) dropped ~11x in
// benchmarks against a real tenant workspace (45 pages: 195.8s -> 16.4s
// total) — esbuild's native, Go-parallel resolution of node_modules/CJS
// interop is what Rollup's plugin chain (node-resolve + commonjs) paid for
// on every cold build. See packages/logos/spike-esbuild/REPORT.md (git
// history) for the full writeup, including a real esbuild/CJS-interop bug
// found and fixed along the way (a first-party CommonJS `.js` file bundled
// directly — not from node_modules — had its `module.exports=` hoisted to
// the top of the bundle by esbuild, clobbering the component's export; fix
// is to author first-party `views/*.js` helpers as ES modules).

// v2 changes over v1:
//   * NO global Module.prototype.require monkey-patch. Svelte 4 pinning is
//     done entirely inside the bundle graph via an esbuild resolve plugin —
//     the rest of the process is free to use any Svelte it wants.
//   * The build cache is keyed to the WHOLE import graph. After each build we
//     persist the graph's file hashes in a manifest; a change in ANY
//     imported component invalidates the page (fixes the v1 bug where editing
//     a component under Home never showed up).
//   * Theme layer: Bootstrap 5 (CDN, opt-out) and/or Tailwind CSS v4 (CDN,
//     opt-in) + CSS variables from bootstrap({ views: { theme } }) — mutable
//     at runtime via setViewsTheme() / setViewsTailwind().
//   * HMR client: every rendered page opens a WS to /ws and reloads when the
//     runtime broadcasts { type: 'views:hmr' } for one of its source files.

// Tailwind support: rather than a build step, we use the official browser
// runtime build (`@tailwindcss/browser`) — the CDN successor to the old
// "Play CDN". It scans the rendered HTML for utility classes and compiles
// them client-side. The same `views.theme` map that feeds the Bootstrap
// `:root` variables is reused: when Tailwind is on, those variables are
// emitted inside a Tailwind v4 `@theme { ... }` block instead, so they also
// generate real utilities (e.g. `--color-primary` → `bg-primary`,
// `text-primary`, `border-primary`), not just custom properties.
'use strict';

fs_1 = __importDefault(require('fs'));

path_1 = __importDefault(require('path'));

crypto_1 = __importDefault(require('crypto'));

utils_1 = {
  ensureDir: function(dir) {
    return fs_1.default.mkdirSync(dir, {
      recursive: true
    });
  }
};

CACHE_DIR = path_1.default.join(process.cwd(), '.svelte-cache');

VIEW_MANIFEST_FORMAT = 4;

TAILWIND_CDN_URL = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4';

exports.HOT_RELOAD_MODES = ['always', 'auto', 'prompt', 'manual'];

SvelteEngine = (function() {
  var SvelteEngine;
  SvelteEngine = function(cacheDir, validationIntervalMs) {
    var _a, cpus;
    if (cacheDir == void 0) {
      cacheDir = CACHE_DIR;
    }
    if (validationIntervalMs == void 0) {
      validationIntervalMs = 0;
    }
    this.widgetIndex = {};
    this.theme = {};
    this.bootstrap5 = true;
    this.tailwind = false;
    this.precompileCss = false;
    this.digests = new (file_digests_1.FileDigests)();
    this.graphChecks = new Map();
    // Builds em voo, por componentName: N requests simultâneos a uma página
    // fria compartilham UM build (esbuild SSR+DOM) em vez de dispararem N em
    // paralelo e saturarem CPU/RAM de um box pequeno (thundering herd).
    this.inflight = new Map();
    // Módulos SSR já carregados, por caminho do bundle. O nome do arquivo é
    // content-hash, então o caminho identifica o conteúdo unicamente: um
    // rebuild gera outro caminho e nunca colide. Evita reler/recompilar o
    // módulo do disco a cada render (antes: delete require.cache + require).
    this.ssrModuleCache = new Map();
    // Uma compilação que falhou na validação não deve derrubar a última versão
    // publicada em cada novo request. O próximo save limpa essa marca e tenta a
    // nova candidata de novo.
    this.failedComponents = new Set();
    this.buildQueue = [];
    // Validações HMR são promovidas em lote. Um render do mesmo componente
    // aguarda a decisão do lote; componentes alheios continuam livres.
    this.validationQueue = Promise.resolve();
    this.validationGates = new Map();
    this.validationIntervalMs = validationIntervalMs;
    this.cacheDir = cacheDir;
    this.tailwindStyles = new tailwind_styles_1.TailwindStyles(cacheDir);
    utils_1.ensureDir.call(void 0, this.cacheDir);
    this.widgetRegistryPath = path_1.default.join(this.cacheDir, 'WidgetRegistry.svelte');
    this.widgetComponentPath = path_1.default.join(this.cacheDir, 'Widget.svelte');
    this.optionalStubPath = path_1.default.join(this.cacheDir, 'OptionalMissing.svelte');
    // O runtime pode ser iniciado de outro diretório (por exemplo, a própria
    // pasta do pacote durante os testes). Resolva o Svelte instalado, em vez
    // de assumir que ele está em `cwd/node_modules`.
    this.svelteDir = path_1.default.dirname(require.resolve('svelte/package.json'));
    cpus = 1;
    try {
      cpus = require('os').cpus().length || 1;
    } catch (error1) {
      _a = error1;
    }
    /* keep 1 */
    // Reserve capacity for interactive HTTP; hosts can explicitly raise this limit.
    this.buildSlots = Math.max(1, Math.min(cpus, Number(process.env.LOGOS_VIEW_BUILD_CONCURRENCY) || 2));
  };
  SvelteEngine.prototype.acquireBuildSlot = function() {
    var _this;
    _this = this;
    if (this.buildSlots > 0) {
      this.buildSlots--;
      return Promise.resolve();
    }
    return new Promise(function(resolve) {
      return _this.buildQueue.push(resolve);
    });
  };
  SvelteEngine.prototype.releaseBuildSlot = function() {
    var next;
    next = this.buildQueue.shift();
    if (next) {
      next();
    } else {
      this.buildSlots++;
    }
  };
  SvelteEngine.prototype.setTheme = function(theme, bootstrap5) {
    this.theme = (theme && typeof theme == 'object' ? theme : {});
    if (bootstrap5 != undefined) {
      this.bootstrap5 = bootstrap5;
    }
  };
  SvelteEngine.prototype.getTheme = function() {
    return __assign({}, this.theme);
  };
  SvelteEngine.prototype.setTailwind = function(enabled, precompileCss) {
    if (precompileCss == void 0) {
      precompileCss = this.precompileCss;
    }
    this.tailwind = Boolean(enabled);
    this.precompileCss = precompileCss;
  };
  SvelteEngine.prototype.getTailwind = function() {
    return this.tailwind;
  };
  SvelteEngine.prototype.hash = function(content) {
    return crypto_1.default.createHash('md5').update(content).digest('hex');
  };
  // ── Import-graph manifest ─────────────────────────────────────────────────

  // <component>.manifest.json = { hash, files: { absPath: contentHash } }
  // Valid while every file in the last build's graph still hashes the same.
  SvelteEngine.prototype.manifestPath = function(componentName) {
    return path_1.default.join(this.cacheDir, ''.concat(componentName, '.manifest.json'));
  };
  SvelteEngine.prototype.fileHash = function(file) {
    var _a;
    try {
      return this.hash(fs_1.default.readFileSync(file, 'utf-8'));
    } catch (error1) {
      _a = error1;
      return 'gone';
    }
  };
  SvelteEngine.prototype.readManifest = function(componentName) {
    var _a;
    try {
      return JSON.parse(fs_1.default.readFileSync(this.manifestPath(componentName), 'utf-8'));
    } catch (error1) {
      _a = error1;
      return null;
    }
  };
  SvelteEngine.prototype.manifestValid = async function(manifest) {
    var _this, cached, entry, key, pending;
    _this = this;
    if (false) {
      await void 0;
    }
    if (!(manifest == null || manifest == void 0 ? void 0 : manifest.files) || manifest.format != VIEW_MANIFEST_FORMAT) {
      return false;
    }
    key = manifest.hash;
    cached = this.graphChecks.get(key);
    if ((cached == null || cached == void 0 ? void 0 : cached.pending)) {
      return cached.pending;
    }
    if (cached && cached.until > Date.now()) {
      return cached.valid;
    }
    entry = {
      until: 0,
      valid: false,
      pending: undefined
    };
    pending = this.digests.graph(Object.keys(manifest.files)).then(function(hashes) {
      var valid;
      valid = Object.entries(manifest.files).every(function(_a) {
        var _b, file, hash;
        _b = __read(_a, 2);
        file = _b[0];
        hash = _b[1];
        return hashes[file] == hash;
      });
      entry.valid = valid;
      entry.until = Date.now() + _this.validationIntervalMs;
      return valid;
    }).finally(function() {
      entry.pending = undefined;
    });
    entry.pending = pending;
    if (this.graphChecks.size > 512) {
      this.graphChecks.clear();
    }
    this.graphChecks.set(key, entry);
    return pending;
  };
  /** Returns component names whose graphs include `changedFile` (for HMR). */
  SvelteEngine.prototype.affectedComponents = function(changedFile) {
    /* skip broken manifest */
    var __caught, _a, _b, _c, _d, e_1, e_1_1, entry, hits, manifest;
    e_1 = void 0;
    _a = void 0;
    this.digests.invalidate(changedFile);
    this.graphChecks.clear();
    hits = [];
    if (!fs_1.default.existsSync(this.cacheDir)) {
      return hits;
    }
    try {
      _b = __values(fs_1.default.readdirSync(this.cacheDir));
      _c = _b.next();
      while (!_c.done) {
        entry = _c.value;
        if (!entry.endsWith('.manifest.json')) {
          _c = _b.next();
          continue;
        }
        try {
          manifest = JSON.parse(fs_1.default.readFileSync(path_1.default.join(this.cacheDir, entry), 'utf-8'));
          if (manifest.files && manifest.files[changedFile] != undefined) {
            hits.push(entry.replace('.manifest.json', ''));
          }
        } catch (error1) {
          _d = error1;
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
    return hits;
  };
  // ── Widget registry (unchanged behaviour, collision-safe) ────────────────
  SvelteEngine.prototype.buildWidgetRegistry = function(workspace) {
    var widgetName;
    var __caught, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, e_2, e_2_1, e_3, e_3_1, e_4, e_4_1, file, importName, imports, mappings, nameCollisions, owners, pkg, pkgPath, qualifiedName, registryBody, safePath, simpleAliases, sourcePath, viewEntries, viewsDir, widgetFiles, widgetFiles_1, widgetFiles_1_1, widgetName, widgetsDir, widgetsDirName;
    e_2 = void 0;
    _a = void 0;
    e_3 = void 0;
    _b = void 0;
    e_4 = void 0;
    _c = void 0;
    this.widgetIndex = {};
    imports = [];
    mappings = [];
    nameCollisions = {};
    if (fs_1.default.existsSync(workspace)) {
      try {
        _d = __values(fs_1.default.readdirSync(workspace));
        _e = _d.next();
        while (!_e.done) {
          pkg = _e.value;
          pkgPath = path_1.default.join(workspace, pkg);
          try {
            if (!fs_1.default.statSync(pkgPath).isDirectory()) {
              _e = _d.next();
              continue;
            }
          } catch (error1) {
            _f = error1;
            _e = _d.next();
            continue;
          }
          viewsDir = path_1.default.join(pkgPath, 'views');
          if (!fs_1.default.existsSync(viewsDir)) {
            _e = _d.next();
            continue;
          }
          viewEntries = void 0;
          try {
            viewEntries = fs_1.default.readdirSync(viewsDir);
          } catch (error1) {
            _g = error1;
            _e = _d.next();
            continue;
          }
          widgetsDirName = viewEntries.find(function(d) {
            return d.toLowerCase() == 'widgets';
          });
          if (!widgetsDirName) {
            _e = _d.next();
            continue;
          }
          widgetsDir = path_1.default.join(viewsDir, widgetsDirName);
          try {
            if (!fs_1.default.statSync(widgetsDir).isDirectory()) {
              _e = _d.next();
              continue;
            }
          } catch (error1) {
            _h = error1;
            _e = _d.next();
            continue;
          }
          widgetFiles = void 0;
          try {
            widgetFiles = fs_1.default.readdirSync(widgetsDir);
          } catch (error1) {
            _j = error1;
            _e = _d.next();
            continue;
          }
          try {
            e_3 = void 0;
            widgetFiles_1 = __values(widgetFiles);
            widgetFiles_1_1 = widgetFiles_1.next();
            while (!widgetFiles_1_1.done) {
              file = widgetFiles_1_1.value;
              if (!file.endsWith('.svelte') && !file.endsWith('.svx')) {
                widgetFiles_1_1 = widgetFiles_1.next();
                continue;
              }
              sourcePath = path_1.default.join(widgetsDir, file);
              try {
                if (!fs_1.default.statSync(sourcePath).isFile()) {
                  widgetFiles_1_1 = widgetFiles_1.next();
                  continue;
                }
              } catch (error1) {
                _k = error1;
                widgetFiles_1_1 = widgetFiles_1.next();
                continue;
              }
              widgetName = file.replace(/\.(svelte|svx)$/, '');
              qualifiedName = ''.concat(pkg, '__').concat(widgetName);
              importName = 'Widget_'.concat(qualifiedName).replace(/[^a-zA-Z0-9]/g, '_');
              safePath = sourcePath.replace(/\\/g, '/');
              imports.push('import '.concat(importName, ' from \'').concat(safePath, '\';'));
              mappings.push('\''.concat(qualifiedName, '\': ').concat(importName));
              (nameCollisions[widgetName] || (nameCollisions[widgetName] = [])).push({
                pkg: pkg,
                importName: importName,
                qualifiedName: qualifiedName
              });
              this.widgetIndex[qualifiedName] = {
                pkg: pkg,
                widgetName: widgetName,
                importName: importName
              };
              widgetFiles_1_1 = widgetFiles_1.next();
            }
          } catch (error1) {
            e_3_1 = error1;
            e_3 = {
              error: e_3_1
            };
          } finally {
            try {
              if (widgetFiles_1_1 && !widgetFiles_1_1.done && (_b = widgetFiles_1.return)) {
                _b.call(widgetFiles_1);
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
          _e = _d.next();
        }
      } catch (error1) {
        e_2_1 = error1;
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (_e && !_e.done && (_a = _d.return)) {
            _a.call(_d);
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
    simpleAliases = [];
    try {
      _l = __values(Object.entries(nameCollisions));
      _m = _l.next();
      while (!_m.done) {
        _o = __read(_m.value, 2);
        widgetName = _o[0];
        owners = _o[1];
        if (owners.length == 1) {
          simpleAliases.push('\''.concat(widgetName, '\': ').concat(owners[0].importName));
          this.widgetIndex[widgetName] = this.widgetIndex[owners[0].qualifiedName];
        } else {
          console.warn('[views] widget name collision: "'.concat(widgetName, '" in [').concat(owners.map(function(o) {
            return o.pkg;
          }).join(', '), ']. ') + 'Use the qualified name (e.g. "'.concat(owners[0].qualifiedName, '").'));
        }
        _m = _l.next();
      }
    } catch (error1) {
      e_4_1 = error1;
      e_4 = {
        error: e_4_1
      };
    } finally {
      try {
        if (_m && !_m.done && (_c = _l.return)) {
          _c.call(_l);
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
    registryBody = function(extraMsg) {
      return '<script>\n  '.concat(imports.join('\n  '), '\n  const registry = { ').concat(__spreadArray(__spreadArray([], __read(mappings), false), __read(simpleAliases), false).join(', '), ' };\n  export let name = \'\';\n  export let filter = \'\';\n  export let max = null;\n  $: limit = max ? parseInt(max, 10) : undefined;\n  $: widgetKeys = Object.keys(registry)\n    .filter(k => { if (k.includes(\'__\')) return false; return filter ? k.toLowerCase().includes(filter.toLowerCase()) : true; })\n    .slice(0, limit);\n</script>\n{#if name}\n  {#if registry[name]}\n    <svelte:component this={registry[name]} {...$$restProps} />\n  {:else}\n    <div style="color:red;border:1px dashed red;padding:.5rem;font-family:monospace;font-size:12px;">\n      [views] Widget "{name}" not found. ').concat(extraMsg, '\n    </div>\n  {/if}\n{:else if filter || max}\n  {#each widgetKeys as widgetKey}\n    <svelte:component this={registry[widgetKey]} {...$$restProps} />\n  {/each}\n{:else}\n  <div style="color:orange;border:1px dashed orange;padding:.5rem;font-family:monospace;font-size:12px;">\n    [views] &lt;Widget&gt; needs <code>name</code>, <code>filter</code> or <code>max</code>.\n  </div>\n{/if}');
    };
    fs_1.default.writeFileSync(this.widgetRegistryPath, registryBody('Try the qualified name (pkg__Widget).'));
    fs_1.default.writeFileSync(this.widgetComponentPath, registryBody('Check available widget names.'));
    // Substituto de uma view de outro pacote que não está instalado. Renderiza
    // nada de propósito: o recurso some da tela, em vez de derrubar a página.
    fs_1.default.writeFileSync(this.optionalStubPath, '<!-- pacote opcional ausente -->\n');
  };
  SvelteEngine.prototype.getWidgetIndex = function() {
    return __assign({}, this.widgetIndex);
  };
  // ── Build ─────────────────────────────────────────────────────────────────
  /**
   * MDSvex preprocessor for `.svx` pages (Markdown + Svelte). Its `markup()`
   * hook no-ops (returns undefined) for files that don't match its configured
   * extension (default `.svx`), so chaining it ahead of the widget-injector
   * preprocessor is safe for plain `.svelte` pages too. Lazily constructed so
   * projects that never use `.svx` never pay for requiring it.
   */
  SvelteEngine.prototype.mdsvexPreprocess = function() {
    var preprocessor;
    preprocessor = void 0;
    return {
      markup: async function(input) {
        var _a, err, mod, nativeImport;
        _a = void 0;
        if (false) {
          await void 0;
        }
        if (!((_a = input.filename) == null || _a == void 0 ? void 0 : _a.endsWith('.svx'))) {
          return undefined;
        }
        if (!preprocessor) {
          try {
            // TypeScript compiles import() to require() in CommonJS mode. Use
            // the native loader explicitly so ESM-only mdsvex releases work
            // while Lógos keeps its public CommonJS contract.
            nativeImport = new Function('specifier', 'return import(specifier)');
            mod = (await (nativeImport('mdsvex')));
            preprocessor = mod.mdsvex();
          } catch (error1) {
            err = error1;
            if (err.code != 'ERR_MODULE_NOT_FOUND' && err.code != 'MODULE_NOT_FOUND') {
              throw err;
            }
            throw new Error('[views] "mdsvex" not installed. Run: npm install mdsvex');
          }
        }
        return preprocessor.markup(input);
      }
    };
  };
  SvelteEngine.prototype.preprocess = function() {
    var importId, importStmt, registryPath;
    registryPath = this.widgetRegistryPath;
    importId = '\'svelte-view-engine:registry\'';
    importStmt = 'import Widget from '.concat(importId, ';');
    return {
      markup: function(_a) {
        var content, filename, scriptMatch;
        content = _a.content;
        filename = _a.filename;
        if (filename == registryPath) {
          return {
            code: content
          };
        }
        if (!content.includes('<Widget')) {
          return {
            code: content
          };
        }
        if (content.includes(importId)) {
          return {
            code: content
          };
        }
        scriptMatch = content.match(/<script([^>]*)>/);
        if (scriptMatch) {
          return {
            code: content.replace(scriptMatch[0], ''.concat(scriptMatch[0], '\n  ').concat(importStmt))
          };
        }
        return {
          code: '<script>\n  '.concat(importStmt, '\n</script>\n').concat(content)
        };
      }
    };
  };
  // esbuild's onResolve doesn't do Node-style directory-to-index.js
  // resolution on a path we hand it directly, so a subpath that lands on a
  // directory (e.g. modern-layout `svelte/internal`) needs the same
  // treatment require.resolve() would give it.
  SvelteEngine.prototype.resolveSvelteRuntimeSubpath = function(runtimeDir, subpath) {
    var candidate;
    candidate = path_1.default.join(runtimeDir, subpath);
    if (fs_1.default.existsSync(candidate) && fs_1.default.statSync(candidate).isDirectory()) {
      candidate = path_1.default.join(candidate, 'index.js');
    } else if (!fs_1.default.existsSync(candidate) && fs_1.default.existsSync(''.concat(candidate, '.js'))) {
      candidate += '.js';
    }
    return candidate;
  };
  SvelteEngine.prototype.plugins = function(isSSR, workspace) {
    var _this, aliasPlugin, bareEntry, esbuildSvelte, exportsMap, isModernLayout, pkgRoot, runtimeDir;
    _this = this;
    esbuildSvelte = requireDep('esbuild-svelte');
    pkgRoot = this.svelteDir.replace(/\\/g, '/');
    // Svelte 3 shipped runtime subpaths (internal/, store/, ...) as physical
    // top-level folders. Svelte 4 moved them under src/runtime/ and only
    // exposes them via package.json "exports" — which this naive path-join
    // alias doesn't consult. Detect the layout instead of assuming v3.
    isModernLayout = !fs_1.default.existsSync(path_1.default.join(this.svelteDir, 'internal'));
    runtimeDir = ''.concat(pkgRoot, '/src');
    exportsMap = require(path_1.default.join(pkgRoot, 'package.json')).exports;
    bareEntry = (isModernLayout ? ''.concat(runtimeDir, '/').concat((isSSR ? 'ssr.js' : 'index.js')) : pkgRoot);
    aliasPlugin = {
      name: 'view-engine-aliases',
      setup: function(build) {
        build.onResolve({
          filter: /^svelte-view-engine:registry$/
        }, function() {
          return {
            path: _this.widgetRegistryPath
          };
        });
        build.onResolve({
          filter: /^@packages\//
        }, function(args) {
          return {
            path: path_1.default.join(workspace, args.path.slice('@packages/'.length))
          };
        });
        // Svelte 4 pinning — contained in the bundle graph, no global patch.
        // Views de OUTRO pacote (../../<pkg>/...) são opcionais: cada tenant
        // instala um conjunto próprio de pacotes, e o que está no repositório
        // não é o que está na imagem. Sem isto, um import para um pacote
        // ausente derruba o build da view inteira —
        // "Could not resolve ../../file-manager/views/FilePicker.svelte" — e a
        // tela não abre, embora o recurso faltante seja acessório.

        // Só age quando o arquivo realmente não existe: com o pacote presente,
        // a resolução é a normal e nada muda.
        build.onResolve({
          filter: /^\.\.\/\.\.\/[^\/]+\/.*\.svelte$/
        }, function(args) {
          var alvo;
          alvo = path_1.default.resolve(args.resolveDir, args.path);
          if (fs_1.default.existsSync(alvo)) {
            return null;
          }
          console.warn('[views] pacote opcional ausente, seguindo sem ele: '.concat(args.path));
          return {
            path: _this.optionalStubPath
          };
        });
        build.onResolve({
          filter: /^svelte(?:\/.*)?$/
        }, function(args) {
          var entry, key, target;
          key = (args.path == 'svelte' ? '.' : './' + args.path.slice(7));
          entry = exportsMap[key];
          target = (typeof entry == 'string' ? entry : entry && (!isSSR && entry.browser || entry.default));
          if (!target) {
            throw new Error('Unsupported Svelte export: ' + key);
          }
          return {
            path: path_1.default.join(pkgRoot, target)
          };
        });
      }
    };
    return [
      aliasPlugin,
      esbuildSvelte({
        compilerOptions: {
          generate: (isSSR ? 'server' : 'client'),
          css: (isSSR ? 'external' : 'injected'),
          compatibility: {
            componentApi: 4
          }
        },
        preprocess: [this.mdsvexPreprocess(),
      this.preprocess()]
      })
    ];
  };
  SvelteEngine.prototype.build = async function(sourcePath, componentName, hash, isSSR, workspace) {
    var esbuild, ext, outPath, result, watchFiles;
    if (false) {
      await void 0;
    }
    esbuild = requireDep('esbuild');
    ext = (isSSR ? 'cjs' : 'mjs');
    outPath = path_1.default.join(this.cacheDir, ''.concat(componentName, '.').concat((isSSR ? 'SSR' : 'DOM'), '.').concat(hash, '.').concat(ext));
    if (fs_1.default.existsSync(outPath)) {
      return {
        outPath: outPath,
        watchFiles: null
      };
    }
    result = (await (esbuild.build(__assign(__assign(__assign(__assign({
      stdin: {
        contents: (isSSR ? 'import Component from '.concat(JSON.stringify(sourcePath), '; import { render } from \'svelte/server\'; export default { render(props) { const result = render(Component, { props }); return { html: result.body, head: result.head, css: { code: \'\' } }; } };') : 'import Component from '.concat(JSON.stringify(sourcePath), '; import { createClassComponent } from \'svelte/legacy\'; export default class LegacyComponent { constructor(options) { return createClassComponent({ component: Component, ...options }); } }')),
        resolveDir: this.cacheDir,
        sourcefile: 'svelte-entry.js',
        loader: 'js'
      },
      bundle: true
    }, (isSSR ? {
      outfile: outPath
    } : {
      outdir: this.cacheDir,
      entryNames: path_1.default.basename(outPath, '.mjs'),
      outExtension: {
        '.js': '.mjs'
      },
      chunkNames: ''.concat(componentName, '.').concat(hash, '.chunk.[hash]'),
      splitting: true,
      minify: true
    })), {
      format: (isSSR ? 'cjs' : 'esm')
    }), (isSSR ? {} : {
      banner: {
        js: 'export {};'
      }
    })), {
      platform: (isSSR ? 'node' : 'browser'),
      conditions: (isSSR ? ['svelte', 'node'] : ['svelte', 'browser']),
      mainFields: ['svelte', 'browser', 'module', 'main'],
      metafile: true,
      write: true,
      legalComments: 'none',
      sourcemap: false,
      logLevel: 'silent',
      plugins: this.plugins(isSSR, workspace)
    }))));
    if (!isSSR && result.metafile) {
      await assets_1.precompressAssets.call(void 0, Object.keys(result.metafile.outputs).map(function(file) {
        return path_1.default.resolve(file);
      }));
    }
    watchFiles = (result.metafile ? Object.keys(result.metafile.inputs).map((function(f) {
      return path_1.default.resolve(f);
    })) : []);
    return {
      outPath: outPath,
      watchFiles: watchFiles
    };
  };
  SvelteEngine.prototype.evictOldBuilds = function(componentName, keepHash) {
    /* ok */
    var __caught, _a, _b, _c, _d, e_5, e_5_1, entry, full;
    e_5 = void 0;
    _a = void 0;
    try {
      _b = __values(fs_1.default.readdirSync(this.cacheDir));
      _c = _b.next();
      while (!_c.done) {
        entry = _c.value;
        if (entry.startsWith(''.concat(componentName, '.')) && !entry.includes(keepHash) && !entry.includes('.chunk.') && /\.(cjs|mjs)$/.test(entry)) {
          full = path_1.default.join(this.cacheDir, entry);
          this.ssrModuleCache.delete(full);
          try {
            fs_1.default.unlinkSync(full);
          } catch (error1) {
            _d = error1;
          }
        }
        _c = _b.next();
      }
    } catch (error1) {
      e_5_1 = error1;
      e_5 = {
        error: e_5_1
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
        if (e_5) {
          throw e_5.error;
        }
      }
    }
  };
  SvelteEngine.prototype.ensureBuilt = async function(sourcePath, componentName, workspace) {
    var _this, built, dom, existing, manifest, ssr, validation;
    _this = this;
    if (false) {
      await void 0;
    }
    validation = this.validationGates.get(componentName);
    if (validation) {
      await validation;
      return this.ensureBuilt(sourcePath, componentName, workspace);
    }
    manifest = this.readManifest(componentName);
    // Fast path: cache válido, sem build — não precisa dedupe nem slot.
    if (manifest && (this.failedComponents.has(componentName) || (await (this.manifestValid(manifest))))) {
      ssr = path_1.default.join(this.cacheDir, ''.concat(componentName, '.SSR.').concat(manifest.hash, '.cjs'));
      dom = path_1.default.join(this.cacheDir, ''.concat(componentName, '.DOM.').concat(manifest.hash, '.mjs'));
      if (fs_1.default.existsSync(ssr) && fs_1.default.existsSync(dom)) {
        return {
          ssr: ssr,
          dom: dom
        };
      }
    }
    // Slow path: dedupe por componentName — um único build compartilhado.
    existing = this.inflight.get(componentName);
    if (existing) {
      return existing;
    }
    built = (async function() {
      var __caught, error;
      if (false) {
        await void 0;
      }
      await _this.acquireBuildSlot();
      try {
        try {
          return (await (_this.compile(sourcePath, componentName, workspace)));
        } catch (error1) {
          error = error1;
          if (!_this.isMissingWidgetRegistryImport(error)) {
            throw error;
          }
          _this.buildWidgetRegistry(workspace);
          return (await (_this.compile(sourcePath, componentName, workspace)));
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        _this.releaseBuildSlot();
      }
    }).call(void 0).finally(function() {
      return _this.inflight.delete(componentName);
    });
    this.inflight.set(componentName, built);
    return built;
  };
  SvelteEngine.prototype.isMissingWidgetRegistryImport = function(error) {
    var message;
    message = (error instanceof Error ? error.message : String(error));
    return /WidgetRegistry\.svelte[\s\S]*(Could not resolve|Could not read|ENOENT)|(?:Could not resolve|Could not read|ENOENT)[\s\S]*WidgetRegistry\.svelte/i.test(message);
  };
  SvelteEngine.prototype.compile = async function(sourcePath, componentName, workspace, promote) {
    var domBuild, files, graphFiles, hash, registrySource, source, ssrBuild, usesWidget;
    if (promote == void 0) {
      promote = true;
    }
    if (false) {
      await void 0;
    }
    registrySource = (fs_1.default.existsSync(this.widgetRegistryPath) ? fs_1.default.readFileSync(this.widgetRegistryPath, 'utf-8') : '');
    source = fs_1.default.readFileSync(sourcePath, 'utf-8');
    // O widget registry é GLOBAL: dobrá-lo no hash de toda página fazia
    // instalar/remover um plugin invalidar o cache de TODAS as páginas (o
    // registry muda) — matando o warm-cache em qualquer tenant com pacotes
    // fora do padrão. Só páginas que usam <Widget> dependem do registry.
    usesWidget = source.includes('<Widget');
    // Content hash seeds the filename; the manifest guards the whole graph.
    // O source da página não muda quando só um filho importado muda. A
    // compilação acontece apenas após manifest inválido; um nonce aqui garante
    // que esbuild não reutilize o bundle do pai com o filho antigo.
    hash = this.hash(source + (usesWidget ? registrySource : '') + crypto_1.default.randomUUID());
    ssrBuild = (await (this.build(sourcePath, componentName, hash, true, workspace)));
    domBuild = (await (this.build(sourcePath, componentName, hash, false, workspace)));
    graphFiles = new Set(__spreadArray(__spreadArray([sourcePath], __read(ssrBuild.watchFiles || []), false), __read(domBuild.watchFiles || []), false));
    // Só páginas com <Widget> ganham o registry no grafo do manifest — assim
    // uma troca de plugin não invalida (via manifestValid) páginas que nem o
    // usam.
    if (usesWidget) {
      graphFiles.add(this.widgetRegistryPath);
    }
    files = (await (this.digests.graph(__spreadArray([], __read(graphFiles), false))));
    if (promote) {
      fs_1.default.writeFileSync(this.manifestPath(componentName), JSON.stringify({
        format: VIEW_MANIFEST_FORMAT,
        hash: hash,
        files: files
      }, null, 2));
      this.evictOldBuilds(componentName, hash);
    }
    return {
      ssr: ssrBuild.outPath,
      dom: domBuild.outPath,
      hash: hash,
      files: files
    };
  };
  SvelteEngine.prototype.invalidate = function(componentName) {
    var _a;
    this.graphChecks.clear();
    this.failedComponents.delete(componentName);
    try {
      fs_1.default.unlinkSync(this.manifestPath(componentName));
    } catch (error1) {
      _a = error1;
    }
  };
  /**
   * Compila e renderiza SSR antes de anunciar uma alteração. Em falha, conserva
   * o manifest/bundle anterior para que a página aberta continue saudável.
   */
  /* ok */
  SvelteEngine.prototype.validateComponents = async function(componentNames, workspace) {
    var _this, validation;
    _this = this;
    if (false) {
      await void 0;
    }
    validation = this.validationQueue.then((function() {
      return _this.validateComponentsNow(componentNames, workspace);
    }), function() {
      return _this.validateComponentsNow(componentNames, workspace);
    });
    this.validationQueue = validation.catch(function() {
      return undefined;
    });
    return validation;
  };
  SvelteEngine.prototype.validateComponentsNow = async function(componentNames, workspace) {
    var component;
    var component;
    var component;
    var candidate;
    var component;
    var candidate;
    var component;
    var candidate;
    var component;
    var manifest;
    var candidates_3;
    var candidates_3_1;
    var _o;
    var component;
    var candidate;
    var previous_1;
    var previous_1_1;
    var _r;
    var component;
    var saved;
    var manifest;
    var component;
    /* ok */
    var View, __caught, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, candidate, candidates, candidates_1, candidates_1_1, candidates_2, candidates_2_1, candidates_3, candidates_3_1, component, componentNames_1, componentNames_1_1, componentNames_2, componentNames_2_1, componentNames_3, componentNames_3_1, componentNames_4, componentNames_4_1, e_10, e_10_1, e_11, e_11_1, e_12, e_12_1, e_13, e_13_1, e_6, e_6_1, e_7, e_7_1, e_8, e_8_1, e_9, e_9_1, err, error, gate, manifest, mod, page, pkg, previous, previous_1, previous_1_1, releaseValidation, saved, source, ssr, svelte, svx;
    e_6 = void 0;
    _a = void 0;
    e_7 = void 0;
    _b = void 0;
    e_8 = void 0;
    _c = void 0;
    e_9 = void 0;
    _d = void 0;
    e_10 = void 0;
    _e = void 0;
    e_11 = void 0;
    _f = void 0;
    e_12 = void 0;
    _g = void 0;
    e_13 = void 0;
    _h = void 0;
    if (false) {
      await void 0;
    }
    this.graphChecks.clear();
    releaseValidation = void 0;
    gate = new Promise(function(resolve) {
      releaseValidation = resolve;
    });
    try {
      componentNames_1 = __values(componentNames);
      componentNames_1_1 = componentNames_1.next();
      while (!componentNames_1_1.done) {
        component = componentNames_1_1.value;
        this.validationGates.set(component, gate);
        componentNames_1_1 = componentNames_1.next();
      }
    } catch (error1) {
      e_6_1 = error1;
      e_6 = {
        error: e_6_1
      };
    } finally {
      try {
        if (componentNames_1_1 && !componentNames_1_1.done && (_a = componentNames_1.return)) {
          _a.call(componentNames_1);
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        if (e_6) {
          throw e_6.error;
        }
      }
    }
    previous = new Map();
    candidates = new Map();
    try {
      componentNames_2 = __values(componentNames);
      componentNames_2_1 = componentNames_2.next();
      while (!componentNames_2_1.done) {
        component = componentNames_2_1.value;
        manifest = this.manifestPath(component);
        try {
          previous.set(component, fs_1.default.readFileSync(manifest, 'utf-8'));
        } catch (error1) {
          _j = error1;
          previous.set(component, null);
        }
        componentNames_2_1 = componentNames_2.next();
      }
    } catch (error1) {
      e_7_1 = error1;
      e_7 = {
        error: e_7_1
      };
    } finally {
      try {
        if (componentNames_2_1 && !componentNames_2_1.done && (_b = componentNames_2.return)) {
          _b.call(componentNames_2);
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        if (e_7) {
          throw e_7.error;
        }
      }
    }
    try {
      try {
        componentNames_3 = __values(componentNames);
        componentNames_3_1 = componentNames_3.next();
        while (!componentNames_3_1.done) {
          component = componentNames_3_1.value;
          _k = __read(component.split('__'), 2);
          pkg = _k[0];
          page = _k[1];
          svelte = path_1.default.join(workspace, pkg, 'views', ''.concat(page, '.svelte'));
          svx = path_1.default.join(workspace, pkg, 'views', ''.concat(page, '.svx'));
          source = (fs_1.default.existsSync(svelte) ? svelte : svx);
          if (!fs_1.default.existsSync(source)) {
            componentNames_3_1 = componentNames_3.next();
            continue;
          }
          await this.acquireBuildSlot();
          candidate = void 0;
          try {
            try {
              candidate = (await (this.compile(source, component, workspace, false)));
            } catch (error1) {
              error = error1;
              if (!this.isMissingWidgetRegistryImport(error)) {
                throw error;
              }
              this.buildWidgetRegistry(workspace);
              candidate = (await (this.compile(source, component, workspace, false)));
            }
          } catch (error1) {
            __caught = error1;
            throw __caught;
          } finally {
            this.releaseBuildSlot();
          }
          candidates.set(component, candidate);
          ssr = candidate.ssr;
          mod = this.ssrModuleCache.get(ssr);
          if (!mod) {
            mod = require(require.resolve(ssr));
            this.ssrModuleCache.set(ssr, mod);
          }
          View = mod.default || mod;
          View.render({});
          componentNames_3_1 = componentNames_3.next();
        }
      } catch (error1) {
        e_8_1 = error1;
        e_8 = {
          error: e_8_1
        };
      } finally {
        try {
          if (componentNames_3_1 && !componentNames_3_1.done && (_c = componentNames_3.return)) {
            _c.call(componentNames_3);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_8) {
            throw e_8.error;
          }
        }
      }
      try {
        // A fila é uma transação: nenhum candidato fica visível (nem remove o
        // bundle anterior) antes de todos os componentes compilarem e passarem
        // pela renderização SSR.
        candidates_1 = __values(candidates);
        candidates_1_1 = candidates_1.next();
        while (!candidates_1_1.done) {
          _l = __read(candidates_1_1.value, 2);
          component = _l[0];
          candidate = _l[1];
          fs_1.default.writeFileSync(this.manifestPath(component), JSON.stringify({
            format: VIEW_MANIFEST_FORMAT,
            hash: candidate.hash,
            files: candidate.files
          }, null, 2));
          candidates_1_1 = candidates_1.next();
        }
      } catch (error1) {
        e_9_1 = error1;
        e_9 = {
          error: e_9_1
        };
      } finally {
        try {
          if (candidates_1_1 && !candidates_1_1.done && (_d = candidates_1.return)) {
            _d.call(candidates_1);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_9) {
            throw e_9.error;
          }
        }
      }
      try {
        candidates_2 = __values(candidates);
        candidates_2_1 = candidates_2.next();
        while (!candidates_2_1.done) {
          _m = __read(candidates_2_1.value, 2);
          component = _m[0];
          candidate = _m[1];
          this.evictOldBuilds(component, candidate.hash);
          this.failedComponents.delete(component);
          candidates_2_1 = candidates_2.next();
        }
      } catch (error1) {
        e_10_1 = error1;
        e_10 = {
          error: e_10_1
        };
      } finally {
        try {
          if (candidates_2_1 && !candidates_2_1.done && (_e = candidates_2.return)) {
            _e.call(candidates_2);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_10) {
            throw e_10.error;
          }
        }
      }
    } catch (error1) {
      err = error1;
      try {
        candidates_3 = __values(candidates);
        candidates_3_1 = candidates_3.next();
        while (!candidates_3_1.done) {
          _o = __read(candidates_3_1.value, 2);
          component = _o[0];
          candidate = _o[1];
          this.ssrModuleCache.delete(candidate.ssr);
          try {
            fs_1.default.unlinkSync(candidate.ssr);
          } catch (error1) {
            _p = error1;
          }
          try {
            /* ok */
            fs_1.default.unlinkSync(candidate.dom);
          } catch (error1) {
            _q = error1;
          }
          candidates_3_1 = candidates_3.next();
        }
      } catch (error1) {
        e_11_1 = error1;
        e_11 = {
          error: e_11_1
        };
      } finally {
        try {
          if (candidates_3_1 && !candidates_3_1.done && (_f = candidates_3.return)) {
            _f.call(candidates_3);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_11) {
            throw e_11.error;
          }
        }
      }
      try {
        previous_1 = __values(previous);
        previous_1_1 = previous_1.next();
        while (!previous_1_1.done) {
          _r = __read(previous_1_1.value, 2);
          component = _r[0];
          saved = _r[1];
          manifest = this.manifestPath(component);
          if (saved == null) {
            try {
              fs_1.default.unlinkSync(manifest);
            } catch (error1) {
              _s = error1;
            }
          } else {
            /* ok */
            fs_1.default.writeFileSync(manifest, saved);
            this.failedComponents.add(component);
          }
          previous_1_1 = previous_1.next();
        }
      } catch (error1) {
        e_12_1 = error1;
        e_12 = {
          error: e_12_1
        };
      } finally {
        try {
          if (previous_1_1 && !previous_1_1.done && (_g = previous_1.return)) {
            _g.call(previous_1);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_12) {
            throw e_12.error;
          }
        }
      }
      throw err;
    } finally {
      try {
        componentNames_4 = __values(componentNames);
        componentNames_4_1 = componentNames_4.next();
        while (!componentNames_4_1.done) {
          component = componentNames_4_1.value;
          if (this.validationGates.get(component) == gate) {
            this.validationGates.delete(component);
          }
          componentNames_4_1 = componentNames_4.next();
        }
      } catch (error1) {
        e_13_1 = error1;
        e_13 = {
          error: e_13_1
        };
      } finally {
        try {
          if (componentNames_4_1 && !componentNames_4_1.done && (_h = componentNames_4.return)) {
            _h.call(componentNames_4);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_13) {
            throw e_13.error;
          }
        }
      }
      this.graphChecks.clear();
      releaseValidation();
    }
  };
  /** Compile assets ahead of the first request without evaluating request-dependent SSR. */
  SvelteEngine.prototype.prewarm = async function(sourcePath, componentName, workspace) {
    if (false) {
      await void 0;
    }
    await this.ensureBuilt(sourcePath, componentName, workspace);
    if (this.tailwind && this.precompileCss) {
      await this.tailwindStyles.build(this.readManifest(componentName), this.theme, workspace);
    }
  };
  // ── Render ────────────────────────────────────────────────────────────────
  /**
   * Tailwind v4 browser build. Loaded as a plain <script> tag — it scans the
   * rendered document for utility classes and compiles them client-side, no
   * build step required. Doesn't conflict with Bootstrap 5 if both are on;
   * most projects will only enable one of the two.
   */
  SvelteEngine.prototype.tailwindTag = function(cssFile) {
    if (!this.tailwind) {
      return '';
    }
    if (!cssFile) {
      return '<script src="'.concat(TAILWIND_CDN_URL, '"></script>');
    }
    // Initial CSS is local and ready. Keep dynamic/plugin-generated utilities
    // working through the existing compiler, loaded after the document parses.
    return '<link rel="stylesheet" href="/svelte-cache/'.concat(cssFile, '">\n<script src="').concat(TAILWIND_CDN_URL, '" defer></script>');
  };
  /**
   * The `views.theme` CSS variables. Plain `:root` custom properties by
   * default; when Tailwind is enabled they're emitted inside a v4
   * `@theme { ... }` block instead, so the exact same config also generates
   * real utility classes (e.g. `--color-primary` → `bg-primary`).
   */
  SvelteEngine.prototype.themeBlock = function() {
    var vars;
    vars = Object.entries(this.theme).map(function(_a) {
      var _b, key, value;
      _b = __read(_a, 2);
      key = _b[0];
      value = _b[1];
      return '  --'.concat(key.replace(/^--/, ''), ': ').concat(value, ';');
    }).join('\n');
    if (!vars) {
      return '';
    }
    if (this.tailwind) {
      return '<style type="text/tailwindcss">\n@theme {\n'.concat(vars, '\n}\n</style>');
    }
    return '<style>:root {\n'.concat(vars, '\n}</style>');
  };
  SvelteEngine.prototype.render = async function(sourcePath, componentName, props, workspace, options) {
    var SSRModule, SvelteSSR, _a, _b, _c, _d, _e, bootstrapTags, clientFile, clientScripts, css, cssFile, dom, filePickerProtocol, head, hmrClient, html, serverCss, ssr;
    _a = void 0;
    _b = void 0;
    _c = void 0;
    if (props == void 0) {
      props = {};
    }
    if (options == void 0) {
      options = {};
    }
    if (false) {
      await void 0;
    }
    _d = (await (this.ensureBuilt(sourcePath, componentName, workspace)));
    ssr = _d.ssr;
    dom = _d.dom;
    // Bundle é content-hash no nome: mesmo caminho ⇒ mesmo conteúdo. Carrega
    // uma vez e reusa; um rebuild produz outro caminho e nunca colide, então
    // não há stale. Antes: delete require.cache + require a cada render (relia
    // o arquivo do disco a cada acesso, mesmo com cache quente).
    SSRModule = this.ssrModuleCache.get(ssr);
    if (!SSRModule) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      SSRModule = require(require.resolve(ssr));
      this.ssrModuleCache.set(ssr, SSRModule);
    }
    SvelteSSR = SSRModule.default || SSRModule;
    _e = SvelteSSR.render(props);
    html = _e.html;
    css = _e.css;
    head = _e.head;
    serverCss = ssr.replace(/\.cjs$/, '.css');
    if (fs_1.default.existsSync(serverCss)) {
      css.code += fs_1.default.readFileSync(serverCss, 'utf8');
    }
    clientFile = path_1.default.basename(dom);
    cssFile = (this.tailwind && this.precompileCss ? (await (this.tailwindStyles.build(this.readManifest(componentName), this.theme, workspace))) : null);
    bootstrapTags = (this.bootstrap5 ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">\n' + '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>' : '');
    hmrClient = hmrClientScript(componentName, {
      mode: ((_a = options.hotReloadMode) != null && _a != void 0 ? _a : 'always'),
      badge: options.hotReloadBadge != false
    });
    filePickerProtocol = filePickerProtocolClientScript();
    clientScripts = ((_b = options.clientScripts) != null && _b != void 0 ? _b : []).filter(function(script) {
      return typeof script == 'string' && script.length > 0;
    });
    return __spreadArray(__spreadArray(['<!DOCTYPE html>', '<html>', '<head>', '<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">', head, this.tailwindTag(cssFile), bootstrapTags, this.themeBlock(), '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">', '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>', '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">', '<title>'.concat(componentName, '</title>'), '<style>body { margin: 0; padding: 0; } '.concat(css.code, '</style>'), '</head>', '<body>', '<div id="app">'.concat(html, '</div>'), '<script type="module">', 'import Component from \'/svelte-cache/'.concat(clientFile, '\';'), 'new Component({ target: document.getElementById(\'app\'), hydrate: true, props: ' + JSON.stringify(props) + ' });', '</script>', filePickerProtocol, hmrClient], __read(clientScripts), false), [((_c = options.offlineClient) != null && _c != void 0 ? _c : ''), '</body>', '</html>'], false).join('\n');
  };
  return SvelteEngine;
}).call(void 0);

exports.SvelteEngine = SvelteEngine;
