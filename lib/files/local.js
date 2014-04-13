
var fs = require('co-fs');
var path = require('path');
var debug = require('debug')('component-walker:files:local');
var calculate = require('hash-stream');

module.exports = File;

/**
 * Create a `file` object representing a local resource.
 * It should ALWAYS be "absolute".
 * Local resources should begin with `/` or `C:\`
 * or whatever Windows does.
 *
 * @param {String} uri
 * @api public
 */

function File(uri) {
  if (~uri.indexOf('://')) throw new Error('URI must not have a protocol - it must be a local path.');
  if (!(this instanceof File)) return new File(uri);
  this.uri = uri;
  this.dirname = path.dirname(uri);
  this.basename = path.basename(uri);
}

/**
 * The current content type of the `.string`.
 * Specifically for transformations.
 * If it isn't different than the exected content type, don't set it.
 *
 * @api public
 */

File.prototype.type = null;

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
  try {
    yield [
      this.getMTime(),
      this.getHash(),
    ]
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error('file does not exist: ' + source);
    throw err;
  }
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
 * Check whether this file is stale.
 * If it is, we return a new `File` instance.
 * i.e. if we need to re-resolve it.
 *
 * @return {Object} file
 * @api private
 */

File.prototype.stale = function* () {
  var stale = new File(this.uri);
  yield* this.setSource(this.source);
  if (this.mtime.getTime() !== stale.mtime.getTime()) return stale;
  if (this.hash.equals(stale.hash)) return false;
  return stale;
}
