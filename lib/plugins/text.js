
/**
 * Convert strings to .js exports.
 */

var mime = require('mime');
var typeis = require('type-is').is;

var File = require('../files/local');

var re = /\.(\w+)\.js$/i;

module.exports = function (options) {
  options = options || {};

  var convert = options.convert !== false;
  var cjs = options.cjs;

  return function* walkText(next) {
    var m = re.exec(this.uri);
    if (!m) return yield* next;

    var ext = m[1];
    // only support text/* mime types for now
    if (!typeis(mime.lookup(ext), 'text/*')) return yield* next;

    // skip if already js or a different content type already
    var file = this.file;
    if (file && file.type && (file.is('js') || !file.is(ext))) return yield* next;

    if (!file) file = this.file = new File(this.uri);
    if (!file.source) yield* file.setSource(file.uri.replace(/\.js$/, ''));
    if (!file.dependencies) file.dependencies = {};
    file.type = ext;

    yield* next;

    // optionally convert this text to a JS string
    if (!convert || !file.is(ext)) return;

    var string = JSON.stringify(yield* file.getString());

    file.type = 'js';
    file.string = cjs
      ? ('module.exports = ' + string)
      : ('export default ' + string);
  }
}
