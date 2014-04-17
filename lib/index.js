
var Walker = module.exports = require('./walker');

Walker.dependency = require('./dependency')
Walker.file = require('./file')
Walker.flatten =
Walker.prototype.flatten = require('./flatten')

Walker.plugins = {};
Walker.files = {};

require('fs').readdirSync(require('path').join(__dirname, 'plugins'))
.forEach(function (name) {
  if (name[0] === '.') return;
  Walker.plugins[name.replace('.js', '')] = require('./plugins/' + name);
})
