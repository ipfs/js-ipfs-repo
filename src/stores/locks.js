'use strict'

const pull = require('pull-stream')
const series = require('run-series')

exports = module.exports

exports.setUp = (basePath, BlobStore) => {
  const store = new BlobStore(basePath)
  const lockFile = 'repo.lock'

  return {
    lock (callback) {
      function createLock () {
        pull(
          pull.values([new Buffer('LOCK')]),
          store.write(lockFile, callback)
        )
      }

      function doesExist (err, exists) {
        if (err) return callback(err)

        if (exists) {
          // default 100ms
          setTimeout(function () {
            store.exists(lockFile, doesExist)
          }, 100)
          return
        }

        createLock()
      }

      store.exists(lockFile, doesExist)
    },

    unlock (callback) {
      series([
        (cb) => store.remove(lockFile, cb),
        (cb) => store.exists(lockFile, (err, exists) => {
          if (err) return cb(err)

          if (exists) {
            return cb(new Error('failed to remove lock'))
          }

          cb()
        })
      ], callback)
    }
  }
}
