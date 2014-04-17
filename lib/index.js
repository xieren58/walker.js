
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

Walker.flatten =
Walker.prototype.flatten = require('./flatten');
