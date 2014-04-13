
var fs = require('fs');
var util = require('util');
var calculate = require('hash-stream');
var debug = require('debug')('component-walker:files:local');

var File = require('./file');

module.exports = Local;

util.inherits(Local, File);

/**
 * Create a `Local` object representing a local resource.
 * It should ALWAYS be "absolute".
 * Local resources should begin with `/` or `C:\`
 * or whatever Windows does.
 *
 * @param {String} uri
 * @api public
 */

function Local(uri) {
  if (~uri.indexOf('://')) throw new Error('URI must not have a protocol - it must be a local path.');
  if (!(this instanceof Local)) return new Local(uri);
  File.call(this, uri);
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

Local.prototype.setSource = function* (source) {
  this.source = source;
  try {
    yield [
      this.getMTime(),
      this.getHash(),
    ]
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error('Local does not exist: ' + source);
    throw err;
  }
}

/**
 * @api private
 */

Local.prototype.getMTime = function* () {
  if (this.mtime) return this.mtime;
  this.stats = yield stat(this.source);
  return this.mtime = this.stats.mtime;
}

/**
 * @api private
 */

Local.prototype.getHash = function* () {
  if (this.hash) return this.hash;
  var hash = yield calculate(this.source, 'sha256');
  return this.hash = hash.toString('base64');
}

/**
 * @api public
 */

Local.prototype.getString = function* () {
  if (this.string) return this.string;
  return this.string = yield read(this.source);
}

/**
 * Check whether this Local is stale.
 * If it is, we return a new `Local` instance.
 * i.e. if we need to re-resolve it.
 *
 * @return {Object} Local
 * @api private
 */

Local.prototype.stale = function* () {
  var stale = new Local(this.uri);
  yield* this.setSource(this.source);
  if (this.mtime.getTime() !== stale.mtime.getTime()) return stale;
  if (this.hash.equals(stale.hash)) return false;
  return stale;
}

function stat(path) {
  return function (done) {
    fs.stat(path, done);
  }
}

function read(path) {
  return function (done) {
    fs.readFile(path, 'utf8', done);
  }
}
