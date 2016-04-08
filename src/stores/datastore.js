'use strict'

const PREFIX_LENGTH = 8

exports = module.exports

function multihashToPath (multihash, extension) {
  extension = extension || 'data'
  const filename = `${multihash.toString('hex')}.${extension}`
  const folder = filename.slice(0, PREFIX_LENGTH)
  const path = folder + '/' + filename

  return path
}

exports.setUp = (basePath, blobStore, locks) => {
  const store = blobStore(basePath + '/blocks')

  return {
    createReadStream: (multihash, extension) => {
      const path = multihashToPath(multihash, extension)
      return store.createReadStream(path)
    },

    createWriteStream: (multihash, extension, cb) => {
      if (typeof extension === 'function') {
        cb = extension
        extension = undefined
      }

      const path = multihashToPath(multihash, extension)
      return store.createWriteStream(path, cb)
    },
    exists: (multihash, extension, cb) => {
      if (typeof extension === 'function') {
        cb = extension
        extension = undefined
      }

      const path = multihashToPath(multihash, extension)
      return store.exists(path, cb)
    },
    remove: (multihash, extension, cb) => {
      if (typeof extension === 'function') {
        cb = extension
        extension = undefined
      }

      const path = multihashToPath(multihash, extension)
      return store.remove(path, cb)
    }
  }
}
