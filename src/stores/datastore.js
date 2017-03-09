'use strict'
const Lock = require('lock')
const pull = require('pull-stream')
const pullWrite = require('pull-write')
const pullDefer = require('pull-defer/source')
const parallel = require('async/parallel')

exports = module.exports

exports.setUp = (basePath, BlobStore, locks) => {
  // locks is passed in but never used.
  const store = new BlobStore(basePath + '/datastore')
  const lock = new Lock()

  function write (key, blob, callback) {
    lock(key, (release) => {
      pull(
        pull.values([blob]),
        store.write(key, release(released))
      )
    })

    function released (err) {
      if (err) {
        return callback(err)
      }
      callback(null, { key: key })
    }
  }

  return {

    getStream (key) {
      if (!key) {
        return pull.error(new Error('Invalid key'))
      }

      const deferred = pullDefer()

      lock(key, (release) => {
        pull(
          store.read(key),
          pull.collect(release(released))
        )
      })

      function released (err, data) {
        if (err) {
          return deferred.abort(err)
        }

        deferred.resolve(
          pull.values([Buffer.concat(data)])
        )
      }
    },

    putStream () {
      let ended = false
      let written = []
      let push = null

      const sink = pullWrite((blobs, cb) => {
        const tasks = writeTasks(blobs)
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

      function writeTasks (blobs) {
        return blobs.map((blob) => {
          return (cb) => {
            write(blob, (err, meta) => {
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
      store.exists(key, callback)
    },

    delete (key, callback) {
      if (!key) {
        return callback(new Error('Invalid key'))
      }
      store.remove(key, callback)
    },

    helloWorld() {
      console.log('hello world')
    }
  }
}

// The 4 keys that need to be stored in the datastore are as follows
// key1= /F5UXA3TTF4JCB5OTOYTDCBGWYFARRBGGIPJR4KKXVXBGOHK4C5MB47SOZHQM3LH6  - possibly routing records
// key2= /F5YGWLYSED25G5RGGECNNQKBDCCMMQ6TDYUVPLOCM4OVYF2YDZ7E5SPAZWWP4 - possibly routing records
// key3= /local/filesroot
// key4= /local/pins

// the hash of /local/filesroot can be found in go-ipfs with ipfs files stat --hash /
// can we find the hash of /local/filesroot in js-ipfs

// does it make sense to implement datastore like the blockstore.
// do I need to use locks as the blockstore does.
