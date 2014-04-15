
/**
 * The `File` interface that all files should inherit from.
 */

var path = require('path');
var mime = require('mime');
var typeis = require('type-is').is;

var slice = [].slice;

module.exports = File;

function File(uri) {
  this.uri = uri;
  this.dirname = path.dirname(uri);
  this.basename = path.basename(uri);
  this.type = mime.lookup(this.basename);
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
  }

  // source: '', // source URI
  // hash: '', // sha256sum has a base64-encoded string
  // mtime: null, // Last-Modified as a `Date`
  // setSource: noop,
  // getString: noop,
  // stale: noop,
}

Object.defineProperties(File.prototype, {
  _type: {
    enumerable: false,
    configurable: true,
  }
})
