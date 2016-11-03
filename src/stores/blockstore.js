'use strict'

const Block = require('ipfs-block')
const Lock = require('lock')
const base32 = require('base32.js')
const path = require('path')
const pull = require('pull-stream')
const pullWrite = require('pull-write')
const pullDefer = require('pull-defer/source')
const parallel = require('async/parallel')

const PREFIX_LENGTH = 5
const EXTENSION = 'data'

exports = module.exports

function multihashToPath (multihash) {
  const encoder = new base32.Encoder()
  const hash = encoder.write(multihash).finalize()
  const filename = `${hash}.${EXTENSION}`
  const folder = filename.slice(0, PREFIX_LENGTH)

  return path.join(folder, filename)
}

exports.setUp = (basePath, BlobStore, locks) => {
  const store = new BlobStore(basePath + '/blocks')
  const lock = new Lock()

  // blockBlob is an object with:
  // { data: <>, key: <> }
  function writeBlock (blockBlob, callback) {
    if (!blockBlob || !blockBlob.data) {
      return callback(new Error('Invalid block'))
    }

    const key = multihashToPath(blockBlob.key)

    lock(key, (release) => {
      pull(
        pull.values([
          blockBlob.data
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

    /*
     * putStream - write multiple blocks
     *
     * returns a pull-stream that expects blockBlobs
     *
     * NOTE: blockBlob is a { data: <>, key: <> } and not a
     * ipfs-block instance. This is because Block instances support
     * several types of hashing and it is up to the BlockService
     * to understand the right one to use (given the CID)
     */
    // TODO
    // consider using a more explicit name, this can cause some confusion
    // since the natural association is
    //   getStream - createReadStream - read one
    //   putStream - createWriteStream - write one
    // where in fact it is:
    //   getStream - createReadStream - read one (the same)
    //   putStream - createFilesWriteStream = write several
    //
    putStream () {
      let ended = false
      let written = []
      let push = null

      const sink = pullWrite((blockBlobs, cb) => {
        const tasks = writeTasks(blockBlobs)
        parallel(tasks, cb)
      }, null, 100, (err) => {
        ended = err || true
        if (push) {
          push(ended)
        }
      })

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

      /*
       * Creates individual tasks to write each block blob that can be
       * exectured in parallel
       */
      function writeTasks (blockBlobs) {
        return blockBlobs.map((blockBlob) => {
          return (cb) => {
            writeBlock(blockBlob, (err, meta) => {
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
      }

      return {
        source: source,
        sink: sink
      }
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
