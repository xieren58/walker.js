
var match = require('normalize-dependencies').js.match;

var File = require('../files/local');
var Dependency = require('../dependency');
var resolve = require('../utils').resolvePath;

module.exports = function () {
  return function* walkJS(next) {
    if (!this.is('js')) return yield* next;

    var file = this.file;
    if (!file) file = this.file = new File(this.uri);
    if (!file.source) yield* file.setSource(this.uri);

    var deps = file.dependencies;
    if (!deps) {
      deps = file.dependencies = {};
      match(yield* file.getString()).forEach(function (m) {
        deps[m.path] = new Dependency(resolve(file.dirname, m.path));
      })
    }

    yield* next;
  }
}
