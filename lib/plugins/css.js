
var depsOf = require('cssdeps');

var File = require('../files/local');
var Dependency = require('../Dependency');
var resolve = require('../utils').resolvePath;

module.exports = function () {
  return function* (next) {
    if (this.type !== 'css') return yield* next;

    var file = this.file;
    if (!file) file = this.file = new File(this.uri);
    if (!file.source) yield* file.setSource(this.uri);

    var deps = file.dependencies;
    if (!deps) {
      deps = file.dependencies = {};
      depsOf(yield* file.getString())
      .forEach(function (uri) {
        deps[uri] = new Dependency(resolve(file.dirname, uri));
      }, this)
    }

    yield* next;
  }
}
