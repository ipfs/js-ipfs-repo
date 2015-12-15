exports = module.exports

exports.setUp = function (basePath, blobStore, locks, config) {
  return {
    get: function (callback) {
      config.get(function (err, config) {
        if (err) {
          return callback(err)
        }
        callback(null, config.Identity.PrivKey)
      })
    }
  }
}
