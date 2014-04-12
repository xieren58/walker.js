
var co = require('co');
var path = require('path');
var assert = require('assert');

var Walker = require('..')

function fixture(name) {
  return path.join(__dirname, 'fixtures', name, 'index.css');
}

describe('css', function () {
  var entrypoint = fixture('css');
  var walker;
  var tree;

  it('should walk', co(function* () {
    walker = Walker()
      .add(entrypoint)
      .use(Walker.defaults());
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
    assert(deps['./something.css']);
    assert(deps['else.css']);
    assert(deps['./something.css'].file.dependencies['what.css']);
  })
})

describe('css-image', function () {
  var entrypoint = fixture('css-image');
  var walker;
  var tree;

  it('should walk', co(function* () {
    walker = Walker()
      .add(entrypoint)
      .use(Walker.defaults());
    tree = yield* walker.tree();
  }))

  it('should return the correct tree', function () {
    tree = tree[entrypoint];
    assert(tree);
    assert(tree.file.dependencies['something.png']);
  })
})
