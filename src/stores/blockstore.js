'use strict'

const Block = require('ipfs-block')
const Lock = require('lock')
const base32 = require('base32.js')
const path = require('path')
const pull = require('pull-stream')
const pullWrite = require('pull-write')
const pullDefer = require('pull-defer')
const parallel = require('async/parallel')
const each = require('async/each')

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
  const BlobStores = Array.isArray(BlobStore) ? BlobStore : [BlobStore]
  const stores = BlobStores.map((BlobStoreClass) => {
    return new BlobStoreClass(basePath + '/blocks')
  })
  const lock = new Lock()

  // blockBlob is an object with:
  // { data: <>, key: <> }
  function writeBlock (blockBlob, callback) {
    if (!blockBlob || !blockBlob.data) {
      return callback(new Error('Invalid block'))
    }

    const key = multihashToPath(blockBlob.key)

    lock(key, (release) => {
      // write to each store in parallel
      each(stores, (store, cb) => {
        pull(
          pull.values([
            blockBlob.data
          ]),
          store.write(key, cb)
        )
      }, release(released))
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
      const deferredSource = pullDefer.source()
      // const deferredSource = pullDefer.source()

      // lock, read from all stores in parallel, take first returned result, and release
      lock(blockPath, (release) => {
        const onComplete = release(onReleased)
        let didComplete = false
        each(stores, (store, cb) => {
          pull(
            store.read(blockPath),
            pull.collect((err, result) => {
              // ignore errors
              if (err) return cb()
              // skip if already resolved
              if (didComplete) return cb()
              // mark as resolved
              didComplete = true
              // resolve result
              onComplete(null, result)
              // cleanup async search
              cb()
            })
          )
        }, (err) => {
          if (err && !didComplete) return onComplete(err)
          if (!didComplete) {
            return onComplete(new Error('BlockStore - entry not found in any blockstore.'))
          }
        })
      })

      function onReleased (err, data) {
        if (err) {
          return deferredSource.abort(err)
        }

        deferredSource.resolve(
          pull.values([
            new Block(Buffer.concat(data))
          ])
        )
      }

      return deferredSource
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
          return cb(end)
        }

        if (written.length) {
          return cb(null, written.shift())
        }

        if (ended) {
          return cb(ended)
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

      // check all stores for exists in parallel
      parallel(stores.map((store) => {
        return (cb) => store.exists(blockPath, cb)
      }), (err, results) => {
        if (err) return callback(err)
        const exists = results.some(Boolean)
        callback(null, exists)
      })
    },

    delete (key, callback) {
      if (!key) {
        return callback(new Error('Invalid key'))
      }

      const blockPath = multihashToPath(key)

      // remove from all stores in parallel
      each(stores, (store, cb) => {
        store.remove(blockPath, cb)
      }, callback)
    }
  }
}
