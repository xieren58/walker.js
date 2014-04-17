
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

## License

The MIT License (MIT)

Copyright (c) 2014 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
