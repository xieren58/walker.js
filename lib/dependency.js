
var mime = require('mime');
var debug = require('debug')('component-walker:dependency');

module.exports = Dependency;

function Dependency(uri) {
  this.uri = uri;
  // essentially, we want to normalize the extension
  this.type = mime.lookup(uri).split('/')[1];
}
