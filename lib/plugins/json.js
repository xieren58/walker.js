
/**
 * To do: check for syntax errors
 */

var re = /json\.js$/i

module.exports = function (options) {
  options = options || {}

  var convert = options.convert !== false
  var loader = options.cjs
    ? 'module.exports = '
    : 'export default'

  return function* walkJSON(next) {
    if (!re.test(this.uri)) return yield* next

    var file = this.file
    // already converted to js
    if (file && file.is('js')) return yield* next

    if (!file) file = this.file = new this.File(this.uri)
    if (!file.source) yield* file.setSource(file.uri.replace(/\.js$/, ''))
    if (!file.dependencies) file.dependencies = {}
    file.type = 'json'

    yield* next

    // optionally convert the JSON to a JS string
    // to do: maybe move this logic to the `text` plugin?
    if (!convert || !file.is('json')) return

    file.type = 'js'
    file.string = loader + (yield* file.getString())
  }
}
