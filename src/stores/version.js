var bl = require('bl')

exports = module.exports

exports.setUp = function (basePath, blobStore, locks) {
  var store = blobStore(basePath)
  return {
    get: function (callback) {
      store
        .createReadStream('version')
        .pipe(bl(function (err, version) {
          if (err) {
            return callback(err)
          }
          callback(null, version.toString('utf8'))
        }))
    },
    set: function (value, callback) {
      // 1. get lock
    }
  }
}
