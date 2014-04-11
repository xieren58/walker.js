
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