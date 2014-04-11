
/**
 * Default middleware for arbitrary files.
 * Should always go last.
 */

var File = require('../files/local');

module.exports = function () {
  return function* (next) {
    if (this.file) return yield* next;

    var file = this.file = new File(this.uri);
    yield* file.setSource(this.uri);
    this.dependencies = {};
    yield* next;
  }
}
