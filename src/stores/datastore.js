'use strict'

const PREFIX_LENGTH = 8

exports = module.exports

function multihashToPath (multihash) {
  const filename = multihash.toString('hex') + '.data'
  const folder = filename.slice(0, PREFIX_LENGTH)
  const path = folder + '/' + filename

  return path
}

exports.setUp = (basePath, blobStore, locks) => {
  const store = blobStore(basePath + '/blocks')

  return {
    createReadStream: (multihash) => {
      const path = multihashToPath(multihash)
      return store.createReadStream(path)
    },

    createWriteStream: (multihash, cb) => {
      const path = multihashToPath(multihash)
      return store.createWriteStream(path, cb)
    },
    exists: (multihash, cb) => {
      const path = multihashToPath(multihash)
      return store.exists(path, cb)
    },
    remove: (multihash, cb) => {
      const path = multihashToPath(multihash)
      return store.remove(path, cb)
    }
  }
}
