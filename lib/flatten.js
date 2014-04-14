
/**
 * Walk the tree putting all dependencies first.
 *
 * @param {Object} tree
 * @return {Array} files
 * @api public
 */

module.exports = function flatten(tree) {
  var files = [];
  walk(tree);
  return files;

  function walk(dependencies) {
    if (!dependencies) return;
    Object.keys(dependencies).forEach(function (name) {
      var file = dependencies[name].file;
      walk(file.dependencies);
      if (!~files.indexOf(file)) files.push(file);
    })
  }
}
