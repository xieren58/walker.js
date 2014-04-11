
var path = require('path');
var depsOf = require('cssdeps');

module.exports = function () {
  return function* (next) {
    yield* next;

    if (this.extname !== '.css') return;
    if (!this.source) yield* this.setSource(this.uri);

    var css = yield* this.getString();
    var deps = this.dependencies;
    depsOf(css).forEach(function (uri) {
      deps[uri] = {
        // convert any relative dependencies to absolute
        // anything else =/
        uri: isData(uri) || isAbsolute(uri)
          ? uri
          : path.resolve(this.dirname, uri)
      }
    }, this)
  }
}

function isData(uri) {
  return uri.indexOf('data:') === 0;
}

function isAbsolute(uri) {
  return ~uri.indexOf('://')
    || uri[0] === '/';
}
