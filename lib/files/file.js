
/**
 * The `File` interface that all files should inherit from.
 */

var debug = require('debug')('normalize-walker:files:file')
var typeis = require('type-is').is;
var path = require('path');
var mime = require('mime');

var Dependency = require('../dependency')

var slice = [].slice;

module.exports = File;

function File(uri) {
  this.uri = uri;
  this.dirname = path.dirname(uri);
  this.basename = path.basename(uri);
  this.type = this.basename;
}

File.prototype = {
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

  // source: '', // source URI
  // hash: '', // sha256sum has a base64-encoded string
  // mtime: null, // Last-Modified as a `Date`
  // setSource: noop,
  // getString: noop,
  // stale: noop,
}
