
var util = require('util');
var compose = require('koa-compose');
var debug = require('debug')('component-walker');
var EventEmitter = require('events').EventEmitter;

var File = require('./file');

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
  this.dependencies[uri] = {
    uri: uri
  };
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
  // already resolved
  if (this.file[uri]) return this.file[uri];
  // in progress
  if (this.progress[uri]) return yield this.await(uri);
  this.progress[uri] = true;

  var file = new File(uri);
  var cache = this.cache[uri];
  if (yield* file.equals(cache)) {
    debug('using from cache %s', uri);
    // use the cache
    file = cache;
  } else {
    // run all the middleware on this file
    // note that this is where caching comes into play
    // if we used a cached object, then we don't need to
    // re-execute all the middleware,
    // many of which are probably CPU-intensive
    // or very I/O bound, i.e. installing remote dependencies.
    yield* this.downstream.call(file, noop.call(file));
  }

  // always re-resolve the dependencies of the file,
  // although most of them are probably cached.
  // this may avoid future issues
  yield* this.resolveDependencies(file);

  dependency.file =
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
