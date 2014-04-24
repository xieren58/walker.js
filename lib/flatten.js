
/**
 * Walk the tree putting all dependencies first.
 *
 * @param {Object} tree
 * @return {Array} files
 * @api public
 */

module.exports = function flatten(tree) {
  var files = []
  var deps = [] // getting cirular dependency issues
  walk(tree)
  return files

  function walk(dependencies) {
    if (!dependencies) return
    if (~deps.indexOf(dependencies)) return
    deps.push(dependencies)
    Object.keys(dependencies).forEach(function (name) {
      var file = dependencies[name].file
      // already walked
      if (~files.indexOf(file)) return
      walk(file.dependencies)
      if (!~files.indexOf(file)) files.push(file)
    })
  }
}
