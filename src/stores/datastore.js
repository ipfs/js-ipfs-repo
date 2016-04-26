'use strict'

const Lock = require('lock')
const stream = require('stream')
const bl = require('bl')
const Block = require('ipfs-block')

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
  const lock = new Lock()

  const createReadStream = (multihash, extension) => {
    const path = multihashToPath(multihash, extension)
    return store.createReadStream(path)
  }

  const createWriteStream = (multihash, extension, cb) => {
    const path = multihashToPath(multihash, extension)
    const through = stream.PassThrough()

    lock(path, (release) => {
      const ws = store.createWriteStream(path, release(cb))
      through.pipe(ws)
    })

    return through
  }

  return {
    get: (key, extension, cb) => {
      if (typeof extension === 'function') {
        cb = extension
        extension = undefined
      }

      if (!key) {
        return cb(new Error('Invalid key'))
      }

      createReadStream(key, 'data')
        .pipe(bl((err, data) => {
          if (err) {
            return cb(err)
          }

          cb(null, new Block(data, extension))
        }))
    },

    put: (block, cb) => {
      if (!block || !block.data) {
        return cb(new Error('Invalid block'))
      }

      const ws = createWriteStream(block.key, block.extension, cb)
      ws.write(block.data)
      ws.end()
    },

    has: (key, extension, cb) => {
      if (typeof extension === 'function') {
        cb = extension
        extension = undefined
      }

      const path = multihashToPath(key, extension)
      store.exists(path, cb)
    },

    delete: (key, extension, cb) => {
      if (typeof extension === 'function') {
        cb = extension
        extension = undefined
      }

      const path = multihashToPath(key, extension)
      store.remove(path, cb)
    }
  }
}
