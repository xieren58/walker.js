
var fs = require('co-fs');
var path = require('path');
var calculate = require('hash-stream');

module.exports = File;

/**
 * Create File objects to be passed through middleware.
 * A URI is passed, which can represent a local resource
 * or an external resource. It should ALWAYS be "absolute".
 * Remote resources should have protocols.
 * Local resources should begin with `/` or `C:\`
 * or whatever Windows does.
 *
 * @param {String} uri
 * @api public
 */

function File(uri) {
  this.dependencies = {};
  this.uri = uri;
  this.dirname = path.dirname(uri);
  this.basename = path.basename(uri);
  this.extname = path.extname(uri);
}

/**
 * Used only within middleware to set the source
 * when the source is not the same as the URI.
 * Specifically, when the plugin compiles from a source.
 * It should be a URI as well.
 *
 * @param {String} source
 * @api public
 */

File.prototype.setSource = function* (source) {
  this.source = source;
  yield [
    this.getMTime(),
    this.getHash(),
  ]
}

/**
 * @api private
 */

File.prototype.getMTime = function* () {
  if (this.mtime) return this.mtime;
  this.stats = yield fs.stat(this.source);
  return this.mtime = this.stats.mtime;
}

/**
 * @api private
 */

File.prototype.getHash = function* () {
  if (this.hash) return this.hash;
  var hash = yield calculate(this.source, 'sha256');
  return this.hash = hash.toString('base64');
}

/**
 * @api public
 */

File.prototype.getString = function* () {
  if (this.string) return this.string;
  return this.string = yield fs.readFile(this.source, 'utf8');
}

/**
 * Compare this `file` with another `file`.
 * This is to check whether a cached `file` is stale.
 * Note that just checking whether the `mtime` is different
 * doesn't work because OS X's mtime resolution is 1 second.
 *
 * @param {File} file
 * @return {Boolean}
 * @api private
 */

File.prototype.equals = function* (file) {
  if (!file) return false;
  var mtime = yield* this.getMTime();
  if (mtime.getTime() !== file.mtime.getTime()) return false;
  var hash = yield* this.getHash();
  return hash.equals(file.hash);
}
