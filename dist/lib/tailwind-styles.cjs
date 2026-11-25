'use strict';
/** Optional acceleration: the existing browser compiler remains a compatibility fallback. */
var TailwindStyles, __importDefault, assets_1, crypto_1, fs_1, path_1, worker_threads_1;

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

exports.TailwindStyles = void 0;

worker_threads_1 = require('worker_threads');

fs_1 = require('fs');

path_1 = __importDefault(require('path'));

crypto_1 = require('crypto');

assets_1 = require('./assets.cjs');

TailwindStyles = (function() {
  var TailwindStyles;
  TailwindStyles = function(cacheDir, pluginPath) {
    this.pending = new Map();
    this.failedUntil = new Map();
    this.queue = Promise.resolve();
    this.cacheDir = cacheDir;
    this.pluginPath = pluginPath;
  };
  TailwindStyles.prototype.build = async function(manifest, theme, workspace) {
    /* build */
    var _a, _b, _c, _d, _this, key, name, output, pending, pluginPath, work;
    _this = this;
    _a = void 0;
    _b = void 0;
    if (false) {
      await void 0;
    }
    if (!(manifest == null || manifest == void 0 ? void 0 : manifest.files)) {
      return null;
    }
    pluginPath = void 0;
    try {
      pluginPath = ((_a = this.pluginPath) != null && _a != void 0 ? _a : require.resolve('@tailwindcss/postcss'));
    } catch (error1) {
      _c = error1;
      return null;
    }
    key = crypto_1.createHash.call(void 0, 'md5').update('css-v1:' + manifest.hash + JSON.stringify(theme)).digest('hex');
    if (((_b = this.failedUntil.get(key)) != null && _b != void 0 ? _b : 0) > Date.now()) {
      return null;
    }
    name = 'tailwind.'.concat(key, '.css');
    output = path_1.default.join(this.cacheDir, name);
    try {
      await fs_1.promises.access(output);
      return name;
    } catch (error1) {
      _d = error1;
    }
    pending = this.pending.get(key);
    if (pending) {
      return pending;
    }
    if (this.pending.size >= 32) {
      return null;
    }
    work = this.queue.then(async function() {
      var css;
      if (false) {
        await void 0;
      }
      css = (await (new Promise(function(resolve, reject) {
        var finish, timer, worker;
        worker = new worker_threads_1.Worker(path_1.default.join(__dirname, 'tailwind-worker.cjs'), {
          workerData: {
            pluginPath: pluginPath,
            files: Object.keys(manifest.files),
            theme: theme,
            workspace: workspace,
            cacheDir: _this.cacheDir
          }
        });
        timer = setTimeout((function() {
          reject(new Error('CSS build timed out'));
          void 0;
        }), 30000);
        finish = function() {
          clearTimeout(timer);
          void 0;
        };
        worker.once('message', function(message) {
          finish();
          (message.error ? reject(new Error(message.error)) : resolve(message.css));
        });
        worker.once('error', function(error) {
          finish();
          reject(error);
        });
        worker.once('exit', function(code) {
          clearTimeout(timer);
          if (code) {
            reject(new Error('CSS worker exited: '.concat(code)));
          }
        });
      })));
      await fs_1.promises.writeFile(output, css);
      await assets_1.precompressAssets.call(void 0, [output]);
      return name;
    }).catch(function(error) {
      if (_this.failedUntil.size >= 512) {
        _this.failedUntil.clear();
      }
      _this.failedUntil.set(key, Date.now() + 60000);
      console.warn('[views:css] falling back to browser compiler: '.concat(error.message));
      return null;
    }).finally(function() {
      return _this.pending.delete(key);
    });
    this.pending.set(key, work);
    this.queue = work;
    return work;
  };
  return TailwindStyles;
}).call(void 0);

exports.TailwindStyles = TailwindStyles;
