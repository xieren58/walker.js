
module.exports = function (options) {
  options = options || {};

  var convert = options.convert;
  var cjs = options.cjs;
  var spaces = options.spaces || 2;

  return function* walkJSON(next) {
    if (!/json\.js$/i.test(this.uri)) return yield* next;

    var file = this.file;
    // already converted to js
    if (file && file.is('js')) return yield* next;

    if (!file) file = this.file = new this.File(this.uri)
    if (!file.source) yield* file.setSource(file.uri.replace(/\.js$/, ''));
    if (!file.dependencies) file.dependencies = {};
    file.type = 'json';

    yield* next;

    // optionally convert the JSON to a JS string
    // to do: maybe move this logic to the `text` plugin?
    if (!convert || !file.is('json')) return;

    var string = JSON.stringify(yield* check(file), null, spaces);

    file.type = 'js';
    file.string = cjs
      ? ('module.exports = ' + string)
      : ('export default ' + string);
  }
}

function* check(file) {
  var string = yield* file.getString();
  // check for syntax errors:
  try {
    return JSON.parse(string);
  } catch (err) {
    throw new Error('Bad JSON: ' + file.source);
  }
}
