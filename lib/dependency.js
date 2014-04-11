
var path = require('path');
var mime = require('mime');
var debug = require('debug')('component-walker:dependency');

module.exports = Dependency;

/**
 * Create a `.dependencies` object.
 */

function Dependency(uri) {
  if (!(this instanceof Dependency)) return new Dependency(uri);
  this.uri = uri;
  // basename
  this.basename = path.basename(uri);
  // normalize the extension to mime-type standards
  this.type = mime.lookup(uri).split('/')[1];
}
