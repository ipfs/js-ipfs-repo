exports = module.exports

exports.setUp = (basePath, blobStore) => {
  var store = blobStore(basePath)
  var lockFile = 'repo.lock'

  return {
    lock: function (cb) {
      store.exists(lockFile, doesExist)

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

      function createLock () {
        store
          .createWriteStream(lockFile)
          .on('finish', () => {
            cb()
          })
          .end()
      }
    },
    unlock: cb => {
      store.remove(lockFile, err => {
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
