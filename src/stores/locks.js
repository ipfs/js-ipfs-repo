exports = module.exports

exports.setUp = function (basePath, blobStore) {
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
          .on('finish', function () {
            cb()
          })
          .end()
      }
    },
    unlock: function (cb) {
      store.remove(lockFile, function (err) {
        if (err) cb(err)
        store.exists(lockFile, function (err, exists) {
          if (err) cb(err)

          store.exists(lockFile, function (err, exists) {
            if (err) cb(err)
            cb()
          })
        })
      })
    }
  }
}
