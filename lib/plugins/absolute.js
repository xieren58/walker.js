
/**
 * Deletes all absolute dependencies.
 * It does not make sense in the context of the walker.
 */

var re = /^\/[^/]/

module.exports = function () {
  return function* walkRemoveAbsolute(next) {
    var file = this.file
    if (!file) return yield* next
    var deps = file.dependencies
    if (!deps) return yield* next

    Object.keys(deps).forEach(function (key) {
      if (re.test(key)) delete deps[key]
    })

    yield* next
  }
}
