
/**
 * A generic cache module.
 * Same API as `lru-cache`, which you should use instead.
 */

module.exports = Cache

function Cache() {
  if (!(this instanceof Cache)) return new Cache()

  this.cache = Object.create(null)
}

Cache.prototype.set = function (key, value) {
  this.cache[key] = value
}

Cache.prototype.get = function (key) {
  return this.cache[key]
}
