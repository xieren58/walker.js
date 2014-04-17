
var debug = require('debug')('normalize-walker:plugins:css');
var match = require('normalize-dependencies').css.match;

var File = require('../files/local');
var resolve = require('../utils').resolvePath;

module.exports = function () {
  return function* walkCSS(next) {
    if (!this.is('css')) return yield* next;

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
