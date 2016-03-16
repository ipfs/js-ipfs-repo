'use strict'

// TODO: This may end up being configurable
// TODO: This should belong to the `fs` implementation

const PREFIX_LENGTH = 8
const multihash = require('multihashes')
const path = require('path')

module.exports = (store) => {
  function hashToPath (hash) {
    const folder = hash.slice(0, PREFIX_LENGTH)
    return path.join(folder, hash) + '.data'
  }

  return {
    read: (hash, cb) => {
      return store.read(hashToPath(hash), cb)
    },

    write: (buf, cb) => {
      const mh = multihash.encode(buf, 'hex')
      return store.write(hashToPath(mh), buf, cb)
    }
  }
}
