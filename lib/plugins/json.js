
var File = require('../files/local');

module.exports = function (options) {
  options = options || {};
  var spaces = options.spaces != null
    ? options.spaces
    : 2;

  return function* walkJSON(next) {
    if (!/json\.js$/i.test(this.uri)) return yield* next;

    this.type = 'javascript';

    var file = this.file;
    if (!file) file = this.file = new File(this.uri);
    if (!file.source) yield* file.setSource(file.uri.replace(/\.js$/, ''));
    if (!file.dependencies) file.dependencies = {};

    var string = yield* file.getString();
    try {
      string = JSON.parse(string);
    } catch (err) {
      throw new Error('Invalid JSON: ' + file.source);
    }
    this.string = 'export default ' + JSON.stringify(string, null, spaces);

    yield* next;
  }
}
