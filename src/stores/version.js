var bl = require('bl')

exports = module.exports

exports.setUp = (basePath, blobStore, locks) => {
  var store = blobStore(basePath)

  return {
    get: callback => {
      store
        .createReadStream('version')
        .pipe(bl((err, version) => {
          if (err) {
            return callback(err)
          }
          callback(null, version.toString('utf8'))
        }))
    },
    set: (value, callback) => {
      locks.lock(err => {
        if (err) {
          return callback(err)
        }

        store.createWriteStream('version')
          .on('finish', () => {
            locks.unlock(callback)
          })
          .end(value)
      })
    }
  }
}
