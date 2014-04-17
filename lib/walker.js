
var util = require('util');
var cache = require('./cache')
var compose = require('koa-compose');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('component-walker:walker');

var Dependency = require('./dependency');

util.inherits(Walker, EventEmitter);

module.exports = Walker;

function Walker(options) {
  if (!(this instanceof Walker)) return new Walker(options);

  options = options || {};

  EventEmitter.call(this, options);
  this.setMaxListeners(0);

  // all the cached file objects based on the URI
  this.cache = options.cache || cache();
  // all the current file objects based on the URI
  this.files = {};
  // resolves in progress
  this.progress = {};
  // list of middleware
  this.middleware = [];
  // the composed middleware function
  this.downstream = compose(this.middleware);
  // each entry point will be its own tree
  this.dependencies = {};
}

/**
 * Entry point must always be an absolute URI.
 *
 * @param {String} uri
 * @api public
 */

Walker.prototype.add = function (uri) {
  this.dependencies[uri] = new Dependency(uri);
  return this;
}

/**
 * Push a generator function to the list of middleware.
 *
 * @param {GeneratorFunction} fn
 * @api public
 */

Walker.prototype.use = function (fn) {
  if (!isGeneratorFunction(fn))
    throw new TypeError('Walker middleware must be generator functions.');

  this.middleware.push(fn);
  return this;
}

/**
 * @api public
 */

Walker.prototype.tree = function* () {
  yield* this.resolveDependencies(this);
  // unset the `.files` object for the next walk
  this.files = {};
  this.progress = {};
  return this.dependencies;
}

/**
 * Resolve all the .dependencies of an object.
 *
 * @param {Object} File
 * @api private
 */

Walker.prototype.resolveDependencies = function* (file) {
  var deps = file.dependencies;
  yield Object.keys(deps).map(function (name) {
    return this.resolve(deps[name]);
  }, this);
  return file;
}

/**
 * Resolve a single .dependency of an object.
 *
 * @param {Object} dependency
 * @api private
 */

Walker.prototype.resolve = function* (dependency) {
  var uri = dependency.uri;
  if (!uri) throw new Error('Every dependency must have a URI.')

  // already resolved this URI on this walk
  if (this.files[uri]) {
    dependency.file = this.files[uri];
    return dependency;
  }

  // resolving this URI is already in progress,
  // so we'll just wait for it
  if (this.progress[uri]) {
    dependency.file = yield* this.await(uri);
    return dependency;
  }

  // now we actually resolve this dependency
  this.progress[uri] = true;

  // if there's already a `.file` object, check to see if it's stale
  var file = dependency.file || this.cache.get(uri);
  var stale = file && (yield* file.stale());
  if (stale) {
    // stale should always be a new object of the same type
    debug('%s is stale', file.source);
    file = dependency.file = stale;
  }

  if (!file || !file.dependencies) {
    yield* this.downstream.call(dependency, noop.call(dependency));
  }

  // a `.file` and its `.dependencies` must always bet set,
  // even if `.dependencies` is empty or `.file` is essentially useless
  file = dependency.file;
  if (!file) throw new Error('A file was not set for dependency ' + uri);
  if (!file.dependencies) throw new Error('No dependencies were set for ' + uri);

  // recursively resolve the dependencies of this file.
  yield* this.resolveDependencies(file);

  // update the cache with this latest file
  this.cache.set(uri, this.files[uri] = file)
  this.emit(uri, file);
  return dependency;
}

/**
 * @api private
 */

Walker.prototype.await = function (event) {
  var self = this;
  return function (done) {
    self.once(event, function (value) {
      done(null, value);
    })
  }
}

/**
 * @api private
 */

function isGeneratorFunction(fn) {
  return fn
    && fn.constructor
    && fn.constructor.name === 'GeneratorFunction';
}

/**
 * @api private
 */

function* noop() {/* jshint noyield:true */}
