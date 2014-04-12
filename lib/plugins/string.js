
/**
 * Convert strings to .js exports.
 */

var File = require('../files/local');

module.exports = function (options) {
  options = options || {};
  // not sure how to make this more generic
  var filter = options.filter || /html\.js$/i;

  return function* walkString(next) {
    if (!filter.test(this.uri)) return yield* next;

    this.type = 'javascript';

    var file = this.file;
    if (!file) file = this.file = new File(this.uri);
    if (!file.source) yield* file.setSource(file.uri.replace(/\.js$/, ''));
    if (!file.dependencies) file.dependencies = {};

    var string = yield* file.getString();
    this.string = 'export default ' + JSON.stringify(string);

    yield* next;
  }
}
