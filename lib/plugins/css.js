
var debug = require('debug')('normalize-walker:plugins:css');
var match = require('normalize-dependencies').css.match;

/**
 * To do: check for syntax errors
 */
 
module.exports = function () {
  return function* walkCSS(next) {
    if (!this.is('css')) return yield* next;

    var file = this.file;
    if (!file) file = this.file = new this.File(this.uri)
    if (!file.source) yield* file.setSource(this.uri);
    if (!file.dependencies) {
      file.dependencies = {}
      match(yield* file.getString()).forEach(function (m) {
        var path = m.path
        file.push(path, file.resolve(path), {
          method: m.type,
          media: m.media || '',
        })
      })
    }

    yield* next;
  }
}
