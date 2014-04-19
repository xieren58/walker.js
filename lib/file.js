
var debug = require('debug')('normalize-walker:file')
var calculate = require('hash-stream');
var typeis = require('type-is').is;
var path = require('path');
var mime = require('mime');
var fs = require('fs');

var resolve = require('./utils').resolvePath;
var Dependency = require('./dependency')

var slice = [].slice;

module.exports = File;

/**
 * Create a `File` object representing a local resource.
 * It should ALWAYS be "absolute".
 * Local resources should begin with `/` or `C:\`
 * or whatever Windows does.
 *
 * @param {String} uri
 * @api public
 */

function File(uri) {
  if (~uri.indexOf('://')) throw new Error('URI must not have a protocol - it must be a local path.')
  if (!(this instanceof File)) return new File(uri)
  this.uri = uri;
  this.dirname = path.dirname(uri);
  this.basename = path.basename(uri);
  this.type = this.basename;
}

File.prototype = {
  source: '', // source URI
  hash: '', // base64-encoded sha256sum
  mtime: null, // last modified date
  length: null, // source file size

  set type(val) {
    this._type = mime.lookup(val);
  },

  get type() {
    return this._type;
  },

  /**
   * Check whether to treat this dependency as any of the types.
   * This is specifically for checking for transformations.
   *
   * @api public
   */

  is: function (types) {
    if (!Array.isArray(types)) types = slice.call(arguments);
    return typeis(this.type, types);
  },

  /**
   * Push a dependency. Could use a better verb,
   * but I wanted to keep it short.
   *
   * @param {String} path (lookup name)
   * @param {String} uri (canonical name)
   * @api public
   */

  push: function (path, uri) {
    debug('setting %s\'s dependency %s as %s', this.uri, path, uri)
    var deps = this.dependencies
       || (this.dependencies = {})
    deps[path] = new Dependency(uri)
    return this
  },

  /**
   * Resolve a path against this file.
   *
   * @param {String} path
   * @api public
   */

  resolve: function (path) {
    return resolve(this.dirname, path)
  },

  /**
   * Used only within middleware to set the source
   * when the source is not the same as the URI.
   * Specifically, when the plugin compiles from a source.
   * It should be a URI as well.
   *
   * @param {String} source
   * @api public
   */

  setSource: function* (source) {
    this.source = source;
    try {
      yield [
        this.getMTime(),
        this.getHash(),
      ]
    } catch (err) {
      if (err.code === 'ENOENT') {
        var err = new Error('Local does not exist: ' + source)
        err.status = 404
        throw err
      }
      throw err;
    }
  },

  /**
   * @api private
   */

  getMTime: function* () {
    if (this.mtime) return this.mtime;
    this.stats = yield stat(this.source);
    this.length = this.stats.size
    return this.mtime = this.stats.mtime;
  },

  /**
   * @api private
   */

  getHash: function* () {
    if (this.hash) return this.hash;
    var hash = yield calculate(this.source, 'sha256');
    return this.hash = hash.toString('base64');
  },

  /**
   * @api public
   */

  getString: function* () {
    if (this.string) return this.string;
    return this.string = yield read(this.source);
  },

  /**
   * Check whether this Local is stale.
   * If it is, we return a new `Local` instance.
   * i.e. if we need to re-resolve it.
   *
   * @return {Object} Local
   * @api private
   */

  stale: function* () {
    var stale = new File(this.uri);
    yield* this.setSource(this.source);
    if (this.mtime.getTime() !== stale.mtime.getTime()) return stale;
    if (this.hash.equals(stale.hash)) return false;
    return stale;
  },
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
