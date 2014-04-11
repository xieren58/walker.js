
var path = require('path');

/**
 * Convert relative paths to absolute.
 */

exports.resolvePath = function (root, uri) {
  return isData(uri) || isAbsolute(uri)
    ? uri
    : path.resolve(root, uri);
}

function isData(uri) {
  return uri.indexOf('data:') === 0;
}

function isAbsolute(uri) {
  return ~uri.indexOf('://')
    || uri[0] === '/';
}
