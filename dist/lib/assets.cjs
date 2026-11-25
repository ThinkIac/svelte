var brotli, brotliCompress, compressedAssets, constants, fs, gzip, path, precompressAssets, promisify, versionedAsset, zip;

path = require('node:path');

({
  promises: fs
} = require('node:fs'));

({promisify} = require('node:util'));

({gzip, brotliCompress, constants} = require('node:zlib'));

zip = promisify(gzip);

brotli = promisify(brotliCompress);

versionedAsset = function(name) {
  return /\.[a-f0-9]{32}(?:\.chunk\.[A-Za-z0-9_-]+)?\.(?:mjs|css)$/.test(name);
};

// Compress once at publication, with at most two concurrent assets.
precompressAssets = async function(files) {
  var cursor;
  cursor = 0;
  await Promise.all(Array.from({
    length: Math.min(2, files.length)
  }, async function() {
    var br, bytes, file, gz, params;
    while (cursor < files.length) {
      file = files[cursor++];
      if (!versionedAsset(path.basename(file))) {
        continue;
      }
      bytes = (await fs.readFile(file));
      if (bytes.length < 1024) {
        continue;
      }
      params = {};
      params[constants.BROTLI_PARAM_QUALITY] = 4;
      [gz, br] = (await Promise.all([zip(bytes), brotli(bytes, {params})]));
      await Promise.all([fs.writeFile(`${file}.gz`, gz), fs.writeFile(`${file}.br`, br)]);
    }
  }));
};

compressedAssets = function(cacheDir) {
  return async function(req, res, next) {
    var encoding, file, name, ref;
    if (false) {
      await void 0;
    }
    if ((ref = req.method) !== 'GET' && ref !== 'HEAD') {
      return next();
    }
    try {
      name = decodeURIComponent(req.path).slice(1);
    } catch (error1) {
      return next();
    }
    if (!(name === path.basename(name) && versionedAsset(name))) {
      return next();
    }
    res.vary('Accept-Encoding');
    if (req.headers.range) {
      return next();
    }
    encoding = req.acceptsEncodings('br', 'gzip', 'identity');
    if (encoding !== 'br' && encoding !== 'gzip') {
      return next();
    }
    file = path.join(cacheDir, `${name}.${encoding === 'br' ? 'br' : 'gz'}`);
    try {
      await fs.access(file);
    } catch (error1) {
      return next();
    }
    res.setHeader('Content-Type', name.endsWith('.css') ? 'text/css' : 'application/javascript');
    res.setHeader('Content-Encoding', encoding);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(file, function(error) {
      if (!error) {
        return;
      }
      if (!res.headersSent) {
        res.removeHeader('Content-Encoding');
      }
      next(error);
    });
  };
};

module.exports = {versionedAsset, precompressAssets, compressedAssets};
