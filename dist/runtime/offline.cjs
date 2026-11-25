// modules/views/offline.ts — reconhecedor de pacotes offline.

// Um pacote declara `runtime.offline` no package.json e marca com `@offline
// cache` os GETs cujo conteúdo pode ser servido do cache. Daí saem três coisas:

//   GET /_logos/offline   política computada em JSON (introspecção e diagnóstico)
//   GET /logos-sw.js      o Service Worker, com a política embutida no corpo
//   <script> na página    registra o SW, desenha "Offline mode" e oferece reload

// Por que a política vai EMBUTIDA no corpo do SW e não é buscada por ele: o
// `fetch` do Service Worker precisa decidir de forma SÍNCRONA se intercepta um
// pedido (respondWith não pode ser chamado depois de um await). Um SW que busca
// a própria política perde essa decisão nos primeiros pedidos após cada start
// frio — justamente quando o aparelho está offline e a página precisa do cache.
// Embutida, a decisão é sempre síncrona; e como o browser troca o SW quando os
// BYTES do script mudam, alterar a política publica o SW novo de graça.
/**
 * Precedência, do mais específico ao mais geral:
 *
 *   1. `runtime.offline` do package.json   (o pacote se declara)
 *   2. `views.offline` do bootstrap        (política do runtime)
 *   3. mode 'off'                          (default: nenhum Service Worker)
 *
 * O default é `off` de propósito. Um Service Worker de escopo raiz muda o
 * comportamento de rede do app inteiro; isso não pode acontecer porque alguém
 * esqueceu de desligar.
 */
/**
 * `/lectio/api/documents/:id/blocks` → `^/lectio/api/documents/[^/]+/blocks$`
 *
 * A conversão acontece aqui, no servidor, e não no Service Worker: o formato
 * Express é conhecido de um lado só, e duplicar a tradução no cliente cria duas
 * gramáticas para divergir.
 */
var OFFLINE_STATE, __assign, __importDefault, __values, buildOfflineManifest, crypto_1, fs_1, getOfflineRoutes, isMode, isReload, isViews, listViewPages, offlineClientScript, path_1, recordOfflineRoutes, resolveOfflinePolicy, routePatternToRegex, serviceWorkerScript, utils_1, viewUrls;

isMode = function(value) {
  return exports.OFFLINE_MODES.indexOf(value) != -1;
};

isReload = function(value) {
  return value == 'prompt' || value == 'manual';
};

isViews = function(value) {
  return value == 'all' || value == 'visited' || Array.isArray(value) && value.every(function(v) {
    return typeof v == 'string';
  });
};

resolveOfflinePolicy = function(container, pkgFolder) {
  var __caught, _a, _b, _c, _d, _e, _f, _g, _h, _j, configured, declared, e_1, e_1_1, merged, source;
  e_1 = void 0;
  _a = void 0;
  _b = void 0;
  _c = void 0;
  _d = void 0;
  _e = void 0;
  _f = void 0;
  _g = void 0;
  declared = ((_e = (_d = (_c = (_b = container.registry) === null || _b === void 0 ? void 0 : _b.getPackage) === null || _c === void 0 ? void 0 : _c.call(_b, pkgFolder)) === null || _d === void 0 ? void 0 : _d.runtime) == null || _e == void 0 ? void 0 : _e.offline);
  configured = ((_g = (_f = container.config) === null || _f === void 0 ? void 0 : _f.views) == null || _g == void 0 ? void 0 : _g.offline);
  merged = __assign({}, exports.DEFAULT_OFFLINE_POLICY);
  try {
    _h = __values([configured, declared]);
    _j = _h.next();
    while (!_j.done) {
      source = _j.value;
      if (!source || typeof source != 'object') {
        _j = _h.next();
        continue;
      }
      if (isMode(source.mode)) {
        merged.mode = source.mode;
      }
      if (typeof source.badge == 'boolean') {
        merged.badge = source.badge;
      }
      if (isViews(source.views)) {
        merged.views = source.views;
      }
      if (isReload(source.reload)) {
        merged.reload = source.reload;
      }
      _j = _h.next();
    }
  } catch (error) {
    e_1_1 = error;
    e_1 = {
      error: e_1_1
    };
  } finally {
    try {
      if (_j && !_j.done && (_a = _h.return)) {
        _a.call(_h);
      }
    } catch (error) {
      __caught = error;
      throw __caught;
    } finally {
      if (e_1) {
        throw e_1.error;
      }
    }
  }
  return merged;
};

recordOfflineRoutes = function(container, pkgFolder, routes) {
  var paths;
  paths = routes.filter(function(r) {
    return (r === null || r === void 0 ? void 0 : r.offline) == 'cache';
  }).map(function(r) {
    return utils_1.routeMountPath.call(void 0, pkgFolder, r.path);
  });
  container.state(OFFLINE_STATE).set(pkgFolder, paths);
};

getOfflineRoutes = function(container, pkgFolder) {
  return container.state(OFFLINE_STATE).get(pkgFolder) || [];
};

routePatternToRegex = function(mountPath) {
  var body;
  body = mountPath.split('/').map(function(segment) {
    if (segment.startsWith(':')) {
      return '[^/]+';
    } else {
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }).join('/');
  return '^'.concat(body, '$');
};

// ── Manifesto ───────────────────────────────────────────────────────────────
/** Views de primeiro nível do pacote (widgets/ e lib/ não são páginas). */
listViewPages = function(pkgDir) {
  var viewsDir;
  viewsDir = path_1.default.join(pkgDir, 'views');
  if (!fs_1.default.existsSync(viewsDir)) {
    return [];
  }
  return fs_1.default.readdirSync(viewsDir, {
    withFileTypes: true
  }).filter(function(e) {
    return e.isFile() && /\.(svelte|svx)$/i.test(e.name);
  }).map(function(e) {
    return e.name.replace(/\.(svelte|svx)$/i, '');
  });
};

viewUrls = function(pkgDir, folder, views) {
  var pages;
  if (views == 'visited') {
    return [];
  }
  pages = (views == 'all' ? listViewPages(pkgDir) : views);
  return pages.map(function(page) {
    return '/view/'.concat(folder, '/').concat(page);
  });
};

buildOfflineManifest = function(container) {
  var __caught, _a, _b, _c, _d, _e, _f, _g, _h, configured, e_2, e_2_1, index, indexPkg, packages, pkg, policy, version;
  e_2 = void 0;
  _a = void 0;
  _b = void 0;
  _c = void 0;
  _d = void 0;
  _e = void 0;
  _f = void 0;
  packages = {};
  try {
    _g = __values(((_d = (_c = (_b = container.registry) === null || _b === void 0 ? void 0 : _b.discover) === null || _c === void 0 ? void 0 : _c.call(_b)) != null && _d != void 0 ? _d : []));
    _h = _g.next();
    while (!_h.done) {
      pkg = _h.value;
      policy = resolveOfflinePolicy(container, pkg.folder);
      if (policy.mode == 'off') {
        _h = _g.next();
        continue;
      }
      packages[pkg.folder] = {
        mode: policy.mode,
        badge: policy.badge,
        reload: policy.reload,
        views: viewUrls(pkg.dir, pkg.folder, policy.views),
        cache: getOfflineRoutes(container, pkg.folder).map(routePatternToRegex)
      };
      _h = _g.next();
    }
  } catch (error) {
    e_2_1 = error;
    e_2 = {
      error: e_2_1
    };
  } finally {
    try {
      if (_h && !_h.done && (_a = _g.return)) {
        _a.call(_g);
      }
    } catch (error) {
      __caught = error;
      throw __caught;
    } finally {
      if (e_2) {
        throw e_2.error;
      }
    }
  }
  // A página montada em `/` só entra se pertencer a um pacote offline.
  configured = ((_f = (_e = container.config) === null || _e === void 0 ? void 0 : _e.views) == null || _f == void 0 ? void 0 : _f.index);
  indexPkg = (configured && typeof configured == 'object' ? configured.package : null);
  index = (indexPkg && packages[indexPkg] ? '/' : null);
  version = crypto_1.default.createHash('md5').update(JSON.stringify({
    packages: packages,
    index: index
  })).digest('hex').slice(0, 12);
  return {
    version: version,
    index: index,
    packages: packages
  };
};

// ── Service Worker ──────────────────────────────────────────────────────────
/**
 * O SW é gerado com o manifesto embutido. Trocar a política troca os bytes do
 * script, e o browser trata bytes diferentes como versão nova — a atualização
 * do SW sai de graça do mecanismo que já existe.
 */
serviceWorkerScript = function(manifest) {
  return '// logos-sw.js — gerado pelo Lógos. Não editar: o corpo carrega a política.\n\'use strict\';\n\nvar MANIFEST = '.concat(JSON.stringify(manifest), ';\nvar CACHE_PREFIX = \'logos-offline-\';\nvar CACHE_NAME = CACHE_PREFIX + MANIFEST.version;\n\n// Padrões compilados no escopo do módulo: o fetch decide sem await (ver o\n// comentário no topo de offline.ts).\nvar VIEW_RE = [];\nvar CACHE_RE = [];\nvar PRECACHE = [];\n\nObject.keys(MANIFEST.packages).forEach(function (folder) {\n  var pkg = MANIFEST.packages[folder];\n  VIEW_RE.push(new RegExp(\'^/view/\' + folder + \'/[^/]+$\'));\n  pkg.cache.forEach(function (source) { CACHE_RE.push(new RegExp(source)); });\n  pkg.views.forEach(function (url) { PRECACHE.push(url); });\n});\nif (MANIFEST.index) PRECACHE.push(MANIFEST.index);\n\nfunction isViewPath(pathname) {\n  if (MANIFEST.index && pathname === MANIFEST.index) return true;\n  return VIEW_RE.some(function (re) { return re.test(pathname); });\n}\n\nfunction isContentPath(pathname) {\n  return CACHE_RE.some(function (re) { return re.test(pathname); });\n}\n\n/**\n * Resposta que pode ir para o cache. Só 2xx: guardar um 401 ou um 500 faria o\n * app servir o erro de volta offline como se fosse o conteúdo. E `no-store`\n * do servidor é respeitado — é como uma rota diz "isto não se guarda".\n */\nfunction cacheable(res) {\n  if (!res || !res.ok || res.type === \'opaque\') return false;\n  var control = res.headers.get(\'cache-control\') || \'\';\n  return control.indexOf(\'no-store\') === -1;\n}\n\nasync function cacheFirst(request) {\n  var cached = await caches.match(request);\n  if (cached) return cached;\n  var res = await fetch(request);\n  if (cacheable(res)) {\n    var cache = await caches.open(CACHE_NAME);\n    cache.put(request, res.clone());\n  }\n  return res;\n}\n\n/** Views: com rede a página é sempre a atual; sem rede, a última que funcionou. */\nasync function networkFirst(request) {\n  try {\n    var res = await fetch(request);\n    if (cacheable(res)) {\n      var cache = await caches.open(CACHE_NAME);\n      cache.put(request, res.clone());\n    }\n    return res;\n  } catch (err) {\n    var cached = await caches.match(request);\n    if (cached) return cached;\n    throw err;\n  }\n}\n\n/** Conteúdo: responde já com o que tem e corrige atrás. */\nasync function staleWhileRevalidate(request) {\n  var cached = await caches.match(request);\n  var network = fetch(request).then(function (res) {\n    if (cacheable(res)) {\n      caches.open(CACHE_NAME).then(function (cache) { cache.put(request, res.clone()); });\n    }\n    return res;\n  }).catch(function (err) {\n    if (cached) return cached;\n    throw err;\n  });\n  return cached || network;\n}\n\n/**\n * Pré-cacheia a página E os bundles que ela importa. Só o HTML não bastaria: a\n * página monta com `import \'/svelte-cache/<hash>.mjs\'` e sem esse arquivo ela\n * abre offline em branco, que é pior que não abrir.\n */\nasync function precacheView(cache, url) {\n  var res = await fetch(url, { credentials: \'same-origin\' });\n  if (!cacheable(res)) return;\n  var html = await res.clone().text();\n  await cache.put(url, res);\n\n  var assets = html.match(/\\/svelte-cache\\/[A-Za-z0-9._-]+/g) || [];\n  var unique = assets.filter(function (a, i) { return assets.indexOf(a) === i; });\n  await Promise.allSettled(unique.map(function (a) { return cache.add(a); }));\n}\n\nself.addEventListener(\'install\', function (event) {\n  event.waitUntil((async function () {\n    var cache = await caches.open(CACHE_NAME);\n    // allSettled: uma view que falha não pode abortar a instalação inteira e\n    // deixar o pacote sem NENHUM cache.\n    await Promise.allSettled(PRECACHE.map(function (url) { return precacheView(cache, url); }));\n    await self.skipWaiting();\n  })());\n});\n\nself.addEventListener(\'activate\', function (event) {\n  event.waitUntil((async function () {\n    var keys = await caches.keys();\n    await Promise.all(keys.map(function (key) {\n      // Versão nova limpa as antigas — SW preso em precache velho é o modo de\n      // falha clássico desse tipo de recurso.\n      if (key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_NAME) return caches.delete(key);\n      return null;\n    }));\n    await self.clients.claim();\n  })());\n});\n\nself.addEventListener(\'fetch\', function (event) {\n  var request = event.request;\n  if (request.method !== \'GET\') return;\n\n  var url;\n  try { url = new URL(request.url); } catch (_) { return; }\n  if (url.origin !== self.location.origin) return;\n\n  // Fora do alcance, sempre: o WebSocket do HMR e do terminal, o próprio SW e a\n  // rota de introspecção (que precisa dizer a verdade sobre a rede).\n  if (url.pathname === \'/logos-sw.js\' || url.pathname === \'/_logos/offline\') return;\n  if (url.pathname === \'/ws\' || url.pathname.indexOf(\'/ws/\') === 0) return;\n\n  // Bundle é content-hash no nome: mesmo nome ⇒ mesmo conteúdo, então cache\n  // primeiro nunca serve nada velho.\n  if (url.pathname.indexOf(\'/svelte-cache/\') === 0) return event.respondWith(cacheFirst(request));\n\n  if (isViewPath(url.pathname)) return event.respondWith(networkFirst(request));\n  if (isContentPath(url.pathname)) return event.respondWith(staleWhileRevalidate(request));\n\n  // Não declarado, não interceptado. Silêncio nunca vira promessa.\n});\n\nself.addEventListener(\'message\', function (event) {\n  var data = event.data || {};\n\n  // "O build mudou enquanto eu estava offline?" — comparar o HTML servido com o\n  // que está em cache responde isso para a página em que o usuário está, que é\n  // a pergunta que o botão de recarregar precisa responder.\n  if (data.type === \'logos-offline:check\') {\n    event.waitUntil((async function () {\n      var changed = false;\n      try {\n        var fresh = await fetch(data.url, { cache: \'no-store\', credentials: \'same-origin\' });\n        if (cacheable(fresh)) {\n          var cached = await caches.match(data.url);\n          if (cached) changed = (await cached.text()) !== (await fresh.clone().text());\n          var cache = await caches.open(CACHE_NAME);\n          await cache.put(data.url, fresh);\n        }\n      } catch (_) { changed = false; }\n      (event.source ? [event.source] : await self.clients.matchAll()).forEach(function (client) {\n        client.postMessage({ type: \'logos-offline:checked\', changed: changed });\n      });\n    })());\n  }\n\n  // Purga explícita. Conteúdo autenticado servido do cache continua legível\n  // depois do logout se ninguém apagar — quem sabe que houve logout é o app.\n  if (data.type === \'logos-offline:purge\') {\n    event.waitUntil((async function () {\n      var keys = await caches.keys();\n      await Promise.all(keys\n        .filter(function (key) { return key.indexOf(CACHE_PREFIX) === 0; })\n        .map(function (key) { return caches.delete(key); }));\n    })());\n  }\n});\n');
};

// ── Cliente injetado na página ──────────────────────────────────────────────
/**
 * Registra o SW e desenha o estado da rede.
 *
 * O badge cinza "Offline mode" é novo; o azul "↻ Update available" é o mesmo do
 * hot-reload, reusado de propósito — dois botões de recarregar desenhados
 * diferente é pior que um.
 */
offlineClientScript = function(policy) {
  return '<script>\n(function () {\n  if (!(\'serviceWorker\' in navigator)) return;\n\n  var badge = '.concat((policy.badge ? 'true' : 'false'), ';\n  var reloadMode = ').concat(JSON.stringify(policy.reload), ';\n  var api = {\n    online: navigator.onLine,\n    mode: ').concat(JSON.stringify(policy.mode), ',\n    reload: function () { location.reload(); },\n    purge: function () {\n      if (navigator.serviceWorker.controller) {\n        navigator.serviceWorker.controller.postMessage({ type: \'logos-offline:purge\' });\n      }\n    },\n  };\n  window.LogosOffline = api;\n\n  function isEmbedded() {\n    // Dentro de iframe o badge fica por conta da página top-level, para o aviso\n    // aparecer uma vez só.\n    try { return window.self !== window.top; } catch (_) { return true; }\n  }\n\n  function pill(id, text, background) {\n    var el = document.getElementById(id);\n    if (el) return el;\n    el = document.createElement(\'button\');\n    el.id = id;\n    el.type = \'button\';\n    el.textContent = text;\n    el.setAttribute(\'style\', [\n      \'position:fixed\', \'right:16px\', \'bottom:16px\', \'z-index:2147483647\',\n      \'padding:10px 16px\', \'border:0\', \'border-radius:999px\',\n      \'font:600 13px/1 system-ui,sans-serif\', \'color:#fff\', \'background:\' + background,\n      \'box-shadow:0 4px 16px rgba(0,0,0,.28)\', \'cursor:default\',\n    ].join(\';\'));\n    (document.body || document.documentElement).appendChild(el);\n    return el;\n  }\n\n  function remove(id) {\n    var el = document.getElementById(id);\n    if (el && el.parentNode) el.parentNode.removeChild(el);\n  }\n\n  function showOffline() {\n    if (!badge || isEmbedded()) return;\n    pill(\'logos-offline-badge\', \'\\u25cf Offline mode\', \'#6b7280\');\n  }\n\n  // SW novo não cria UI global: a navegação/HMR automática converge em uma\n  // fronteira segura, sem o antigo botão azul.\n  function showUpdate() {}\n\n  function emit(online) {\n    try {\n      document.dispatchEvent(new CustomEvent(\'logos:offline-changed\', { detail: { online: online } }));\n    } catch (_) {}\n  }\n\n  function goOffline() {\n    api.online = false;\n    showOffline();\n    emit(false);\n  }\n\n  function goOnline() {\n    api.online = true;\n    remove(\'logos-offline-badge\');\n    emit(true);\n    // Só oferece recarregar se o servidor tiver mesmo algo diferente: botão que\n    // aparece sem nada novo atrás ensina o usuário a ignorá-lo.\n    if (reloadMode !== \'prompt\') return;\n    if (!navigator.serviceWorker.controller) return;\n    navigator.serviceWorker.controller.postMessage({\n      type: \'logos-offline:check\',\n      url: location.href,\n    });\n  }\n\n  navigator.serviceWorker.addEventListener(\'message\', function (event) {\n    var data = event.data || {};\n    if (data.type === \'logos-offline:checked\' && data.changed) showUpdate();\n  });\n\n  window.addEventListener(\'offline\', goOffline);\n  window.addEventListener(\'online\', goOnline);\n\n  navigator.serviceWorker.register(\'/logos-sw.js\', { scope: \'/\' }).catch(function (err) {\n    console.warn(\'[logos:offline] service worker não registrou:\', err);\n  });\n\n  if (!navigator.onLine) goOffline();\n})();\n</script>');
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

exports.DEFAULT_OFFLINE_POLICY = exports.OFFLINE_MODES = void 0;

exports.resolveOfflinePolicy = resolveOfflinePolicy;

exports.recordOfflineRoutes = recordOfflineRoutes;

exports.getOfflineRoutes = getOfflineRoutes;

exports.routePatternToRegex = routePatternToRegex;

exports.buildOfflineManifest = buildOfflineManifest;

exports.serviceWorkerScript = serviceWorkerScript;

exports.offlineClientScript = offlineClientScript;

fs_1 = __importDefault(require('fs'));

path_1 = __importDefault(require('path'));

crypto_1 = __importDefault(require('crypto'));

utils_1 = {
  routeMountPath: function(pkg, route) {
    if (route.startsWith('/')) {
      return route;
    } else {
      return '/'.concat(pkg, '/').concat(route);
    }
  }
};

exports.OFFLINE_MODES = ['off', 'shell'];

exports.DEFAULT_OFFLINE_POLICY = {
  mode: 'off',
  badge: true,
  views: 'visited',
  reload: 'prompt'
};

// ── Rotas cacheáveis ────────────────────────────────────────────────────────

// O http module grava aqui, no mount, os caminhos já montados das rotas que
// declararam `@offline cache`. Ler daqui (em vez de reescanear o pacote) mantém
// UMA fonte: o que o SW cacheia é exatamente o que o Express serve.
OFFLINE_STATE = 'offline';
