
var co = require('co')
var path = require('path')
var assert = require('assert')

var Walker = require('..')

function fixture(name) {
  return path.join(__dirname, 'fixtures', name, 'index.css')
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

describe('css', function () {
  var entrypoint = fixture('css')
  var walker
  var tree

  it('should walk', co(function* () {
    walker = defaults(Walker().add(entrypoint))
    tree = yield* walker.tree()
  }))

  it('should return the correct tree', function () {
    var node = tree[entrypoint]
    assert(node)
    assert.equal(node.uri, entrypoint)
    var file = node.file
    assert.ok(file)
    assert.ok(file.mtime)
    assert.ok(file.hash)
    assert.ok(file.basename)
    var deps = file.dependencies
    assert(deps['./something.css'])
    assert.equal(deps['./something.css'].priority, 0)
    assert(deps['else.css'])
    assert.equal(deps['else.css'].priority, 1)
    assert(deps['./something.css'].file.dependencies['what.css'])
  })

  it('should flatten in the correct order', function () {
    var files = Walker.flatten(tree).map(function (x) {
      return x.basename
    })
    assert.deepEqual(files, [
      'what.css',
      'something.css',
      'else.css',
      'index.css',
    ])
  })
})

describe('css-image', function () {
  var entrypoint = fixture('css-image')
  var walker
  var tree

  it('should walk', co(function* () {
    walker = defaults(Walker().add(entrypoint))
    tree = yield* walker.tree()
  }))

  it('should return the correct tree', function () {
    tree = tree[entrypoint]
    assert(tree)
    assert(tree.file.dependencies['something.png'])
  })
})

describe('css-absolute', function () {
  var entrypoint = fixture('css-absolute')

  describe('when absolute=true', function () {
    it('should parse absolute URLs', co(function* () {
      var walker = defaults(Walker(), {
        absolute: true
      }).add(entrypoint)
      try {
        var tree = yield* walker.tree()
        throw new Error()
      } catch (err) {
        assert.equal(err.message, 'Local does not exist: /something/else.css')
      }
    }))
  })

  describe('when absolute=false', function () {
    it('should not parse absolute URLs', co(function* () {
      var walker = defaults(Walker(), {
        absolute: false
      }).add(entrypoint)
      var tree = yield* walker.tree()
      assert(!tree[entrypoint].file.dependencies['/something/else.css'])
    }))
  })
})
