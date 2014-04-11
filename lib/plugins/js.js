
var requires = require('requires');
var imports = require('imports');

var File = require('../files/local');
var Dependency = require('../Dependency');
var resolve = require('../utils').resolvePath;

module.exports = function () {
  return function* walkJS(next) {
    if (this.type !== 'javascript') return yield* next;

    var file = this.file;
    if (!file) file = this.file = new File(this.uri);
    if (!file.source) yield* file.setSource(this.uri);

    var deps = file.dependencies;
    if (!deps) {
      deps = file.dependencies = {};
      var js = yield* file.getString();
      requires(js).forEach(addDependency);
      imports(js).forEach(addDependency);
    }

    yield* next;

    function addDependency(match) {
      deps[match.path] = new Dependency(resolve(file.dirname, match.path));
    }
  }
}
