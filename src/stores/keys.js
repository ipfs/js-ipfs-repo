exports = module.exports

exports.setUp = (basePath, blobStore, locks, config) => {
  return {
    get: callback => {
      config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        callback(null, config.Identity.PrivKey)
      })
    }
  }
}
