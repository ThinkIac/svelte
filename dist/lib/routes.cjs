// The host supplies its HTTP mount, authorization-aware resolver and renderer.
var __assign, _a, compressedAssets, fs, mountPackageViews, path, versionedAsset;

mountPackageViews = function(container, pkg, _a) {
  var _b, _c, _d, engine, getEngine, getPackageMount, mount, mounted, renderPage, replacePublicViews, resolveEntryView, staticAssets, viewsDir;
  _b = void 0;
  _c = void 0;
  _d = void 0;
  getEngine = _a.getEngine;
  getPackageMount = _a.getPackageMount;
  replacePublicViews = _a.replacePublicViews;
  resolveEntryView = _a.resolveEntryView;
  renderPage = _a.renderPage;
  staticAssets = _a.staticAssets;
  if (((_c = (_b = container.config) === null || _b === void 0 ? void 0 : _b.views) === null || _c === void 0 ? void 0 : _c.enabled) == false) {
    return;
  }
  viewsDir = path.join(pkg.dir, 'views');
  if (!fs.existsSync(viewsDir)) {
    return;
  }
  replacePublicViews(container, pkg.folder, viewsDir);
  engine = getEngine(container);
  mounted = container.state('views');
  if (!mounted.get('registryBuilt')) {
    engine.buildWidgetRegistry(container.workspace);
    mounted.set('registryBuilt', true);
  }
  mount = getPackageMount(container);
  if (!mounted.get('cacheMounted')) {
    mount.use('/svelte-cache', compressedAssets(engine.cacheDir), staticAssets(engine.cacheDir, {
      setHeaders: function(res, filePath) {
        if (filePath.endsWith('.mjs')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
        if (versionedAsset(path.basename(filePath))) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.vary('Accept-Encoding');
        }
      }
    }));
    mounted.set('cacheMounted', true);
  }
  if (!mounted.get('route:'.concat(pkg.folder))) {
    mount.get('/view/'.concat(pkg.folder), function(req, res) {
      var entry;
      entry = resolveEntryView(viewsDir, Boolean(req.user));
      if (!entry) {
        return res.status(404).send('[views] no entry page found in package "'.concat(pkg.folder, '"'));
      }
      return renderPage(container, pkg.folder, entry.page, __assign({}, req.query), res, Boolean(req.user));
    });
    mount.get('/view/'.concat(pkg.folder, '/:page'), function(req, res) {
      return renderPage(container, pkg.folder, req.params.page, __assign({}, req.query), res, Boolean(req.user));
    });
    mounted.set('route:'.concat(pkg.folder), true);
    container.log(''.concat(((_d = pkg.name) != null && _d != void 0 ? _d : pkg.folder), ' registered [GET] /view/').concat(pkg.folder, '[/:page] → views/*.svelte'));
  }
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

fs = require('fs');

path = require('path');

_a = require('./assets.cjs');

compressedAssets = _a.compressedAssets;

versionedAsset = _a.versionedAsset;

module.exports = {
  mountPackageViews: mountPackageViews
};
