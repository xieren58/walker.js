
var debug = require('debug')('normalize-walker:plugins:css');
var match = require('normalize-dependencies').css.match;

var File = require('../files/local');
var Dependency = require('../dependency');
var resolve = require('../utils').resolvePath;

module.exports = function () {
  return function* walkCSS(next) {
    if (!this.is('css')) return yield* next;

    var file = this.file;
    if (!file) file = this.file = new File(this.uri);
    if (!file.source) yield* file.setSource(this.uri);

    var deps = file.dependencies;
    if (!deps) {
      deps = file.dependencies = {};
      match(yield* file.getString()).forEach(function (m) {
        debug('got dependency: %s', JSON.stringify(m, null, 2));
        deps[m.path] = new Dependency(resolve(file.dirname, m.path));
        debug('resolved %s and %s to %s', file.dirname, m.path, deps[m.path].uri);
      })
    }

    yield* next;
  }
}
