
var path = require('path');

exports.isRelative = isRelative;
exports.isData = isData;
exports.isAbsolute = isAbsolute;

/**
 * Convert relative paths to absolute.
 * Does not handle remote URLs - that should be done with middleware.
 *
 * @param {String} root
 * @param {String} uri
 */

exports.resolvePath = function (root, uri) {
  return isRelative(uri)
    ? path.resolve(root, uri)
    : uri;
}

function isRelative(uri) {
  return !(isData(uri) || isAbsolute(uri));
}

function isData(uri) {
  return uri.indexOf('data:') === 0;
}

function isAbsolute(uri) {
  return ~uri.indexOf('://')
    || uri[0] === '/';
}
