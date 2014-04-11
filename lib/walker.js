
var util = require('util');
var compose = require('koa-compose');
var debug = require('debug')('component-walker:walker');
var EventEmitter = require('events').EventEmitter;

var Dependency = require('./dependency');

util.inherits(Walker, EventEmitter);

module.exports = Walker;

function Walker(options) {
  if (!(this instanceof Walker)) return new Walker(options);

  options = options || {};

  EventEmitter.call(this, options);
  this.setMaxListeners(0);

  // look up a previous cache of file objects
  this.cache = options.cache || {};
  // all the current file objects
  this.file = {};
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
  return this.dependencies;
}

/**
 * Resolve all the .dependencies of an object.
 *
 * @param {Object} File
 * @api private
 */

Walker.prototype.resolveDependencies = function* (file) {
  var fns = [];
  var deps = file.dependencies;
  Object.keys(deps).forEach(function (name) {
    fns.push(this.resolve(deps[name]));
  }, this);
  yield fns;
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
  // resolving this URI is already in progress
  if (this.progress[uri]) return yield this.await(uri);
  this.progress[uri] = true;

  // if there's already a cached file and it's stale,
  // then overwrite it.
  var file = dependency.file || this.file[uri] || this.cache[uri];
  var stale = file && (yield* file.stale());
  if (stale) {
    debug('%s is stale', file.source);
    file = dependency.file = stale;
  }

  // re-execute the middleware if `.file` is not set
  // or the file's `.dependencies` are not set
  if (!dependency.file || !dependency.file.dependencies) {
    // we only execute the middleware on a dependency
    // when dependencies are not declared.
    yield* this.downstream.call(dependency, noop.call(dependency));
  }

  // a `.file` must always bet set, even if essentially empty
  file = dependency.file;
  if (!file) throw new Error('A file was not set for dependency ' + uri);

  // recursively resolve the dependencies of this file.
  yield* this.resolveDependencies(file);

  // update the cache with this latest file
  this.cache[uri] =
  this.file[uri] = file;
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
