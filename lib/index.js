
var compose = require('koa-compose');

var Walker = module.exports = require('./walker');

Walker.dependency = require('./dependency');
Walker.plugins = {};
Walker.files = {};

var fs = require('fs');

[
  'plugins',
  'files',
].forEach(function (dir) {
  fs.readdirSync(__dirname + '/' + dir)
  .forEach(function (name) {
    if (name[0] === '.') return;
    Walker[dir][name.replace('.js', '')] = require('./' + dir + '/' + name);
  })
})

/**
 * Default plugins for the walker.
 * In general, you should add this last after all your custom plugins.
 *
 *  walker.use(myCustomPlugin());
 *  walker.use(Walker.defaults())
 *  var tree = yield* walker.tree();
 *
 * @param {Object} options
 * @api public
 */

Walker.defaults =
Walker.prototype.defaults = function (options) {
  options = options || {};
  return compose([
    'string',
    'json',
    'js',
    'css',
    'file',
  ].map(function (name) {
    return Walker.plugins[name](options);
  }));
}
