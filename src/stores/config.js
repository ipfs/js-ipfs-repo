var bl = require('bl')

exports = module.exports

exports.setUp = (basePath, blobStore, locks) => {
  var store = blobStore(basePath)
  return {
    get: callback => {
      store
        .createReadStream('config')
        .pipe(bl((err, config) => {
          if (err) {
            return callback(err)
          }
          var result
          try {
            result = JSON.parse(config)
          } catch (err) {
            return callback(err)
          }
          callback(null, result)
        }))
    },

    set: (config, callback) => {
      locks.lock(err => {
        if (err) {
          return callback(err)
        }

        store.createWriteStream('config')
          .on('finish', () => {
            locks.unlock(callback)
          })
          .end(JSON.stringify(config))
      })
    }
  }
}
