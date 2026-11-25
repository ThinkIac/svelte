var __read, _a, parentPort, path, workerData;

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

// Build-time worker: CSS scanning/optimization must not occupy the HTTP thread.
_a = require('node:worker_threads');

parentPort = _a.parentPort;

workerData = _a.workerData;

path = require('node:path');

(async function() {
  var cssPath, input, pluginPath, postcss, quote, result, sources, tailwind, vars;
  if (false) {
    await void 0;
  }
  pluginPath = workerData.pluginPath;
  postcss = require(require.resolve('postcss', {
    paths: [path.dirname(pluginPath)]
  }));
  tailwind = require(pluginPath);
  cssPath = require.resolve('tailwindcss/index.css', {
    paths: [path.dirname(pluginPath)]
  });
  quote = function(value) {
    return JSON.stringify(value.replaceAll('\\', '/'));
  };
  sources = workerData.files.filter(function(file) {
    return !file.includes('/node_modules/') && /\.(svelte|svx|js|ts)$/.test(file);
  }).map(function(file) {
    return '@source '.concat(quote(file), ';');
  }).join('\n');
  vars = Object.entries(workerData.theme).map(function(_a) {
    var _b, key, value;
    _b = __read(_a, 2);
    key = _b[0];
    value = _b[1];
    return '--'.concat(key.replace(/^--/, ''), ': ').concat(value, ';');
  }).join('\n');
  input = '@import '.concat(quote(cssPath), ' source(none);\n').concat(sources, '\n').concat((vars ? '@theme { '.concat(vars, ' }') : ''));
  result = (await (postcss([
    tailwind({
      base: workerData.workspace,
      optimize: true
    })
  ]).process(input, {
    from: path.join(workerData.cacheDir, 'tailwind-input.css')
  })));
  parentPort.postMessage({
    css: result.css
  });
}).call(void 0).catch(function(error) {
  return parentPort.postMessage({
    error: error.message
  });
});
