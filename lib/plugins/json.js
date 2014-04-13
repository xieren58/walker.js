
var File = require('../files/local');

module.exports = function () {
  return function* walkJSON(next) {
    if (!/json\.js$/i.test(this.uri)) return yield* next;

    var file = this.file;
    // already converted to js
    if (file && file.is('js')) return yield* next;

    if (!file) file = this.file = new File(this.uri);
    if (!file.source) yield* file.setSource(file.uri.replace(/\.js$/, ''));
    if (!file.dependencies) file.dependencies = {};
    file.type = 'json';

    yield* next;
  }
}
