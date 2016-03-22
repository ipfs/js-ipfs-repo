'use strict'

exports = module.exports

exports.setUp = (basePath, blobStore) => {
  const store = blobStore(basePath)
  const lockFile = 'repo.lock'

  return {
    lock: function (cb) {
      function createLock () {
        store
          .createWriteStream(lockFile)
          .on('finish', () => {
            cb()
          })
          .end()
      }

      function doesExist (err, exists) {
        if (err) {
          return cb(err)
        }
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
    unlock: (cb) => {
      store.remove(lockFile, (err) => {
        if (err) { return cb(err) }
        store.exists(lockFile, (err, exists) => {
          if (err) { return cb(err) }

          store.exists(lockFile, (err, exists) => {
            if (err) { return cb(err) }
            cb()
          })
        })
      })
    }
  }
}
