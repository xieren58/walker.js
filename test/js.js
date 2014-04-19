
var co = require('co');
var path = require('path');
var assert = require('assert');

var Walker = require('..')

function fixture(name) {
  return path.join(__dirname, 'fixtures', name, 'index.js');
}

function defaults(walker, options) {
  options = options || {}
  walker.use(Walker.plugins.text(options))
  walker.use(Walker.plugins.json(options))
  walker.use(Walker.plugins.js(options))
  walker.use(Walker.plugins.css(options))
  walker.use(Walker.plugins.file(options))
  if (!options.absolute)
    walker.use(Walker.plugins.absolute(options))
  return walker
}

describe('js', function () {
  var entrypoint = fixture('js');
  var walker;
  var tree;

  it('should walk', co(function* () {
    walker = defaults(Walker().add(entrypoint))
    tree = yield* walker.tree();
  }))

  it('should return the correct tree', function () {
    tree = tree[entrypoint];
    assert(tree);
    assert.equal(tree.uri, entrypoint);
    var file = tree.file;
    assert.ok(file);
    assert.ok(file.mtime);
    assert.ok(file.hash);
    assert.ok(file.basename);
    var deps = file.dependencies;
    assert(deps['./emitter.js']);
    assert(deps['./lol.js']);
    assert(deps['./something.js']);
  })
})

describe('js-html', function () {
  var entrypoint = fixture('js-html');
  var walker;
  var tree;
  var file;

  it('should walk', co(function* () {
    walker = defaults(Walker().add(entrypoint))
    tree = yield* walker.tree();
  }))

  it('should return the correct tree', co(function* () {
    tree = tree[entrypoint];
    assert(tree);
    assert.equal(tree.uri, entrypoint);
    file = tree.file.dependencies['./thing.html.js'].file;
  }))

  it('should transform the string', co(function* () {
    var string = yield* file.getString();
    string = string.replace(/export default\s*/, '');
    string = JSON.parse(string);
    assert.deepEqual(string.trim(), '<body></body>');
  }))
})

describe('js-json', function () {
  var entrypoint = fixture('js-json');
  var walker;
  var tree;
  var file;

  it('should walk', co(function* () {
    walker = defaults(Walker().add(entrypoint))
    tree = yield* walker.tree();
  }))

  it('should return the correct tree', co(function* () {
    tree = tree[entrypoint];
    assert(tree);
    assert.equal(tree.uri, entrypoint);
    file = tree.file.dependencies['./stuff.json.js'].file;
  }))

  it('should transform the string', co(function* () {
    var string = yield* file.getString();
    string = string.replace(/export default\s*/, '');
    string = JSON.parse(string);
    assert.deepEqual(string, {
      message: 'LOL'
    });
  }))
})
