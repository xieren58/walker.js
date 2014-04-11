
var compose = require('koa-compose');

var Walker = module.exports = require('./walker');

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
 * walker.use(Walker.defaults())
 */

Walker.defaults =
Walker.prototype.defaults = function (options) {
  options = options || {};
  return compose([
    'css',
    'js',
    'file',
  ].map(function (name) {
    return Walker.plugins[name](options);
  }))
}
