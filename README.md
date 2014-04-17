
# File Dependency Walker

## API

This API is really rough and is open to suggestions.

```js
var Walker = require('component-walker');
```

### var walker = Walker()

Creates a new `Walker` instance.

### walker.add(entrypoint)

Add an entry point to the `walker`. `entrypoint` should be an absolute URI. The walker will walk down every entry point.

```js
var walker = Walker(options)
  .add(__dirname + '/index.js')
  .add(__dirname + '/index.css')
  .add(__dirname + '/index.html')
```

### walker.use(middleware)

Use a middleware.
Middleware are Koa-style generator functions.

### var tree = yield* walker.tree()

Return the tree. Returns an object hashed by each entry point.

```js
var tree = yield* walker.tree();

tree[__dirname + '/index.js'];
tree[__dirname + '/index.css'];
tree[__dirname + '/index.html'];
```

This can and should be used multiple times to create fresh trees with caching:

```js
var tree;
tree = yield* walker.tree();
yield function (done) {
  setTimeout(done, 1000);
}
// will be fast as files are cached
tree = yield* walker.tree();
```

### walker.plugins

### walker.files

### walker.dependency
