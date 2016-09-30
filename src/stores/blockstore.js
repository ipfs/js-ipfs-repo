'use strict'

const Block = require('ipfs-block')
const pull = require('pull-stream')
const Lock = require('lock')
const base32 = require('base32.js')
const path = require('path')
const pullWrite = require('pull-write')
const parallel = require('run-parallel')
const pullDefer = require('pull-defer/source')

const PREFIX_LENGTH = 5

exports = module.exports

function multihashToPath (multihash) {
  const extension = 'data'
  const encoder = new base32.Encoder()
  const hash = encoder.write(multihash).finalize()
  const filename = `${hash}.${extension}`
  const folder = filename.slice(0, PREFIX_LENGTH)

  return path.join(folder, filename)
}

exports.setUp = (basePath, BlobStore, locks) => {
  const store = new BlobStore(basePath + '/blocks')
  const lock = new Lock()

  function writeBlock (block, callback) {
    if (!block || !block.data) {
      return callback(new Error('Invalid block'))
    }

    const key = multihashToPath(block.key())

    lock(key, (release) => {
      pull(
        pull.values([
          block.data
        ]),
        store.write(key, release(released))
      )
    })

    // called once the lock is released
    function released (err) {
      if (err) {
        return callback(err)
      }
      callback(null, { key: key })
    }
  }

  return {
    // returns a pull-stream of one block being read
    getStream (key) {
      if (!key) {
        return pull.error(new Error('Invalid key'))
      }

      const blockPath = multihashToPath(key)
      const deferred = pullDefer()

      lock(blockPath, (release) => {
        pull(
          store.read(blockPath),
          pull.collect(release(released))
        )
      })

      function released (err, data) {
        if (err) {
          return deferred.abort(err)
        }

        deferred.resolve(
          pull.values([
            new Block(Buffer.concat(data))
          ])
        )
      }

      return deferred
    },

    // returns a pull-stream to write blocks into
    // TODO use a more explicit name, given that getStream is just for
    // one block, multiple blocks should have different naming
    putStream () {
      let ended = false
      let written = []
      let push = null

      const sink = pullWrite((blocks, cb) => {
        const tasks = blocks.map((block) => {
          return (cb) => {
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
          }
        })

        parallel(tasks, cb)
      }, null, 100, (err) => {
        ended = err || true
        if (push) {
          push(ended)
        }
      })

      // TODO ??Why does a putStream need to be a source as well??
      const source = (end, cb) => {
        if (end) {
          ended = end
        }
        if (ended) {
          return cb(ended)
        }

        if (written.length) {
          return cb(null, written.shift())
        }

        push = cb
      }

      return { source: source, sink: sink }
    },

    has (key, callback) {
      if (!key) {
        return callback(new Error('Invalid key'))
      }

      const blockPath = multihashToPath(key)
      store.exists(blockPath, callback)
    },

    delete (key, callback) {
      if (!key) {
        return callback(new Error('Invalid key'))
      }

      const blockPath = multihashToPath(key)
      store.remove(blockPath, callback)
    }
  }
}
