
var debug = require('debug')('normalize-walker:plugins:js');
var match = require('normalize-dependencies').js.match;

var File = require('../files/local');
var resolve = require('../utils').resolvePath;

module.exports = function () {
  return function* walkJS(next) {
    if (!this.is('js')) return yield* next;

    var file = this.file;
    if (!file) file = this.file = new File(this.uri);
    if (!file.source) yield* file.setSource(this.uri);
    if (!file.dependencies) {
      file.dependencies = {}
      match(yield* file.getString()).forEach(function (m) {
        file.push(m.path, resolve(file.dirname, m.path))
      })
    }

    yield* next;
  }
}
