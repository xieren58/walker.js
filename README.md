
# File Dependency Walker

Walk down dependencies of JS, CSS, HTML, etc. and create a tree.
As this walker is primarily just a framework for walking,
essentially any type of file is supported,
allowing native support of dependencies between different types of files.

There's no longer a need for any `component.json`, `package.json`, or `bower.json` files.
All dependencies will be declared within the files themselves in a future compatible way.
The walker will be able to handle references to other modules through various middleware.
In other words, users declare dependencies using WHATWG, ES6, and current specifications.
Examples:

Declaring dependencies in CSS:

```css
@import 'https://component.io/necolas/normalize.css/^3.0.1/normalize.css';
@import './something.css' (max-width: 1024px);

#logo {
  background-image: url('logo.png');
}
```

Declaring dependencies in JS:

```js
module Emitter from "https://component.io/component/emitter/^1.0.0/index.js";
import Domify from "https://component.io/component/domify/^1.0.0/index.js";
import util from "./util.js";
```

Declaring dependencies in HTML:

```html
<script type="module" name="emitter" src="https://component.io/component/emitter/^1.0.0/index.js"></script>
<link rel="stylesheet" href="https://component.io/necolas/normalize.css/^3.0.1/normalize.css">
<link type="import" href="https://component.io/web/component/^1.0.0/index.html">
```

The best part of this is that using this walker should be essentially optional in the future as browsers should be able to handle dependencies in this manner natively.
In other words, eventually you won't __need__ a build process, though there are many reasons you'd still want to bundle your scripts and stylesheets.
Start building for the future __NOW__!

## Benefits

This framework is superior to other bundlers in many ways:

- Future compatible. This works on top of standards and makes none of its own opinions.
- Essentially optional since the assets you create should eventually work in browsers without a bundler or package manager.
- No `.json` files anywhere unless they are actually used by the client. Metadata can be crawled from the repositories.
- Package manager support is easy as they are essentially just middleware that handles specific URIs.
- As we envision https://component.io to simply SPDY Push all the dependencies to the client, concurrency control is unnecessary. The tree is literally built as fast as possible with maximum concurrency and caching.
- This walker caches based on `mtime` and `sha256` sums, both of which are suitable for `Last-Modified` and `ETag` headers, respectively. In other words, this walker pretty acts like HTTP caching and makes serving these files easy as well.
- Bundling based on the returned tree is relatively easy as most of the contents are already in memory and the dependencies are already resolved. Builders would essentially just have to concatenate all the contents and rewrite URIs.
- Koa-like generator-based middleware framework to transform files and return dependencies. The framework itself handles all the caching, so middleware will be very concise.
- There's no streaming!
- There's no npm!
- It's tiny!

## Costs

- Specific end points - for this to work, we need proxies to GitHub and other repositories to normalize various aspects of this process, otherwise it would be __too__ inconvenient. However, this creates another point of failure, though setting up your own proxy shouldn't be difficult.
- Long URLs and dependency names - there's no shortcuts when writing your dependency URLs. If the browser won't support it, then there's really no point in us supporting it.
- Dependencies must be specific - for example, Javascript dependencies must end with a `.js`, unlike how `require()`s currently work with node.js.

## API

This API is really rough and is open to suggestions.

```js
var Walker = require('component-walker');
```

### var walker = Walker([options])

Creates a new `Walker` instance. Options:

- `cache` - an object to cache `file` objects. You can create this once and use it on every subsequent build.

```js
var cache = {};
var options = {cache: cache};

var tree = yield* Walker(options))
  .add(__dirname + '/index.js')
  .use(Walker.plugins.js())
  .tree();

// this build will be much faster
var tree = yield* Walker(options))
  .add(__dirname + '/index.js')
  .use(Walker.plugins.js())
  .tree();
```

### walker.add(entrypoint)

Add an entry point to the `walker`. `entrypoint` should be an absolute URI. The walker will walk down every entry point.

```js
Walker(options)
  .add(__dirname + '/index.js')
  .add(__dirname + '/index.css')
```

### walker.use(middleware)

Use a middleware. Middleware are Koa-style generator functions.

### var tree = yield* walker.tree()

Return the tree. Returns an object hashed by each entry point.

```js
var tree = yield* walker.tree();

tree[__dirname + '/index.js'];
tree[__dirname + '/index.css'];
```

### Middleware

Middleware look like this:

```js
walker.use(function* (next) {
  yield* next;

  // not JS, so don't do anything
  if (this.extname !== '.js') return;

  // set the source filename if not already set
  // it could be different than `this.uri` if transpilations occur
  if (!this.source) yield* this.setSource(this.uri);

  // optionally read the file,
  // specifically when you need to parse for dependencies
  var string = yield* this.getString();

  // maybe do some transformations
  var string = this.string = transform(string);

  // have upstream middleware treat this string as a different type of file
  this.extname = '.css';

  // add dependencies
  this.dependencies['../emitter.js'] = {
    uri: '/Users/jong/emitter.js'
  }
})
```

You might be confused by the `yield* next`.
The idea is that the "core" middleware such as CSS should always occur last,
so we `yield* next` to allow all downstream middleware to execute first.
It would be weird if `.use()` actually executed middleware in reverse order.

`this` is a `File` object. This might be a little confusing, but it makes composing middleware much easier.

Middleware should do the following:

1. Check whether to act on a file
2. Set the source URI, which could be different than `.uri` if you transform the file
3. Read or transform the string.
4. Read the dependencies of the file and push them to the `.dependencies` object.

Thus, "upstream" middleware (`.use()`d first) should generally return the dependencies of files, whereas "downstream" middleware (`.use()`d last) should read and/or transform the file. Package managers would be placed very downstream.

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
