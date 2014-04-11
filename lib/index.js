
var Walker = module.exports = require('./walker');

var plugins = Walker.plugins = {};

require('fs').readdirSync(__dirname + '/plugins').forEach(function (name) {
  if (name[0] === '.') return;
  plugins[name.replace('.js', '')] = require('./plugins/' + name);
});
