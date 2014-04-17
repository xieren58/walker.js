
var path = require('path');
var mime = require('mime');
var typeis = require('type-is').is;
var debug = require('debug')('component-walker:dependency');

var slice = [].slice;

module.exports = Dependency;

/**
 * Create a `.dependencies` object.
 */

function Dependency(uri) {
  if (!(this instanceof Dependency)) return new Dependency(uri);
  this.uri = uri;
  // basename
  this.basename = path.basename(uri);
  this.type = mime.lookup(this.basename);
}

Dependency.prototype.file = null;

/**
 * Check whether to treat this dependency as any of the types.
 * This is specifically for filtering middleware.
 *
 * @api public
 */

Dependency.prototype.is = function (types) {
  if (!Array.isArray(types)) types = slice.call(arguments);
  var file = this.file;
  if (!file || !file.type) return typeis(this.type, types);
  return file.is(types);
}
