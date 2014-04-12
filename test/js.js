
var co = require('co');
var path = require('path');
var assert = require('assert');

var Walker = require('..')

function fixture(name) {
  return path.join(__dirname, 'fixtures', name, 'index.js');
}

describe('js', function () {
  var entrypoint = fixture('js');
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
    assert(deps['./emitter.js']);
    assert(deps['./lol.js']);
    assert(deps['./something.js']);
  })
})

describe('js-html', function () {
  var entrypoint = fixture('js-html');
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
    var thing = tree.file.dependencies['./thing.html.js'];
    var content = thing.string;
    var html = JSON.parse(content.replace(/^\s*export default\s*/, '')).trim();
    assert.equal(html, '<body></body>');
  })
})

describe('js-json', function () {
  var entrypoint = fixture('js-json');
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
    var thing = tree.file.dependencies['./stuff.json.js'];
    var content = thing.string;
    var html = JSON.parse(content.replace(/^\s*export default\s*/, ''));
    assert.deepEqual(html, {
      message: 'LOL'
    });
  })
})
