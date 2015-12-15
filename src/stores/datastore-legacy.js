// TODO: This may end up being configurable
// TODO: This should belong to the `fs` implementation
var PREFIX_LENGTH = 8
var multihash = require('multihashes')
var path = require('path')

module.exports = function (store) {
  function hashToPath (hash) {
    var folder = hash.slice(0, PREFIX_LENGTH)
    return path.join(folder, hash) + '.data'
  }

  return {
    read: function (hash, cb) {
      return store.read(hashToPath(hash), cb)
    },

    write: function (buf, cb) {
      var mh = multihash.encode(buf, 'hex')
      return store.write(hashToPath(mh), buf, cb)
    }
  }
}
