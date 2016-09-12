'use strict'

const Block = require('ipfs-block')
const pull = require('pull-stream')
const Lock = require('lock')
const base32 = require('base32.js')
const path = require('path')
const write = require('pull-write')
const parallel = require('run-parallel')
const defer = require('pull-defer/source')

const PREFIX_LENGTH = 5

exports = module.exports

function multihashToPath (multihash, extension) {
  extension = extension || 'data'
  const encoder = new base32.Encoder()
  const hash = encoder.write(multihash).finalize()
  const filename = `${hash}.${extension}`
  const folder = filename.slice(0, PREFIX_LENGTH)

  return path.join(folder, filename)
}

exports.setUp = (basePath, BlobStore, locks) => {
  const store = new BlobStore(basePath + '/blocks')
  const lock = new Lock()

  function writeBlock (block, cb) {
    if (!block || !block.data) {
      return cb(new Error('Invalid block'))
    }

    const key = multihashToPath(block.key, block.extension)

    lock(key, (release) => pull(
      pull.values([block.data]),
      store.write(key, release((err) => {
        if (err) {
          return cb(err)
        }
        cb(null, {key})
      }))
    ))
  }

  return {
    getStream (key, extension) {
      if (!key) {
        return pull.error(new Error('Invalid key'))
      }

      const p = multihashToPath(key, extension)
      const deferred = defer()

      lock(p, (release) => {
        const ext = extension === 'data' ? 'protobuf' : extension
        pull(
          store.read(p),
          pull.collect(release((err, data) => {
            if (err) {
              return deferred.abort(err)
            }

            deferred.resolve(pull.values([
              new Block(Buffer.concat(data), ext)
            ]))
          }))
        )
      })

      return deferred
    },

    putStream () {
      let ended = false
      let written = []
      let push = null

      const sink = write((blocks, cb) => {
        parallel(blocks.map((block) => (cb) => {
          writeBlock(block, (err, meta) => {
            if (err) {
              return cb(err)
            }

            if (push) {
              const read = push
              push = null
              read(null, meta)
              return cb()
            }

            written.push(meta)
            cb()
          })
        }), cb)
      }, null, 100, (err) => {
        ended = err || true
        if (push) push(ended)
      })

      const source = (end, cb) => {
        if (end) ended = end
        if (ended) {
          return cb(ended)
        }

        if (written.length) {
          return cb(null, written.shift())
        }

        push = cb
      }

      return {source, sink}
    },

    has (key, extension, cb) {
      if (typeof extension === 'function') {
        cb = extension
        extension = undefined
      }

      if (!key) {
        return cb(new Error('Invalid key'))
      }

      const p = multihashToPath(key, extension)
      store.exists(p, cb)
    },

    delete (key, extension, cb) {
      if (typeof extension === 'function') {
        cb = extension
        extension = undefined
      }

      if (!key) {
        return cb(new Error('Invalid key'))
      }

      const p = multihashToPath(key, extension)
      store.remove(p, cb)
    }
  }
}
