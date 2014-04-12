
/**
 * Default middleware for arbitrary files.
 * Should always go last.
 */

var File = require('../files/local');

module.exports = function () {
  return function* walkFile(next) {
    // already handled by upstream middleware
    // this should be the LAST middleware
    // as it adds the file as a generic file
    // it only checks for the file's existence.
    if (this.file) return yield* next;

    var file = this.file = new File(this.uri);
    file.dependencies = {};
    yield* file.setSource(this.uri);
    yield* next;
  }
}
