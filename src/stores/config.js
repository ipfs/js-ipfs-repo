var bl = require('bl')

exports = module.exports

exports.setUp = function (basePath, blobStore, locks) {
  var store = blobStore(basePath)
  return {
    get: function (callback) {
      store
        .createReadStream('config')
        .pipe(bl(function (err, config) {
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

    set: function (config, callback) {
      locks.lock(function (err) {
        if (err) {
          return callback(err)
        }

        store.createWriteStream('config')
          .on('finish', function () {
            locks.unlock(callback)
          })
          .end(JSON.stringify(config))
      })
    }
  }
}
