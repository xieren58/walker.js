
var debug = require('debug')('normalize-walker:plugins:js');
var match = require('normalize-dependencies').js.match;

module.exports = function () {
  return function* walkJS(next) {
    if (!this.is('js')) return yield* next;

    var file = this.file;
    if (!file) file = this.file = new this.File(this.uri)
    if (!file.source) yield* file.setSource(this.uri);
    if (!file.dependencies) {
      file.dependencies = {}
      match(yield* file.getString()).forEach(function (m) {
        var path = m.path
        file.push(path, file.resolve(path), {
          method: m.type,
        })
      })
    }

    yield* next;
  }
}
