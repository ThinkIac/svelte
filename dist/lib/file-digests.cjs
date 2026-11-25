'use strict';
/** Bounded concurrent I/O; ctime detects edits whose mtime was restored. */
var FileDigests, crypto_1, fs_1;

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.FileDigests = void 0;

fs_1 = require('fs');

crypto_1 = require('crypto');

FileDigests = (function() {
  var FileDigests;
  FileDigests = function() {
    this.cache = new Map();
    this.pending = new Map();
  };
  FileDigests.prototype.invalidate = function(file) {
    this.cache.delete(file);
  };
  FileDigests.prototype.hash = function(file) {
    var _this, pending, work;
    _this = this;
    pending = this.pending.get(file);
    if (pending) {
      return pending;
    }
    work = this.read(file).finally(function() {
      return _this.pending.delete(file);
    });
    this.pending.set(file, work);
    return work;
  };
  FileDigests.prototype.read = async function(file) {
    var _a, after, cached, data, hash, signature, stat;
    if (false) {
      await void 0;
    }
    try {
      stat = (await (fs_1.promises.stat(file, {
        bigint: true
      })));
      signature = ''.concat(stat.dev, ':').concat(stat.ino, ':').concat(stat.size, ':').concat(stat.mtimeNs, ':').concat(stat.ctimeNs);
      cached = this.cache.get(file);
      if ((cached === null || cached === void 0 ? void 0 : cached.signature) == signature) {
        return cached.hash;
      }
      data = (await (fs_1.promises.readFile(file)));
      hash = crypto_1.createHash.call(void 0, 'md5').update(data).digest('hex');
      after = (await (fs_1.promises.stat(file, {
        bigint: true
      })));
      if (after.ctimeNs == stat.ctimeNs && after.mtimeNs == stat.mtimeNs && after.size == stat.size) {
        if (this.cache.size >= 20000) {
          this.cache.delete(this.cache.keys().next().value);
        }
        this.cache.set(file, {
          signature: signature,
          hash: hash
        });
      }
      return hash;
    } catch (error) {
      _a = error;
      this.cache.delete(file);
      return 'gone';
    }
  };
  FileDigests.prototype.graph = async function(files) {
    var _this, index, result;
    _this = this;
    if (false) {
      await void 0;
    }
    result = {};
    index = 0;
    await Promise.all(Array.from({
      length: Math.min(16, files.length)
    }, async function() {
      var file;
      if (false) {
        await void 0;
      }
      while (index < files.length) {
        file = files[index++];
        result[file] = (await (_this.hash(file)));
      }
    }));
    return result;
  };
  return FileDigests;
}).call(void 0);

exports.FileDigests = FileDigests;
