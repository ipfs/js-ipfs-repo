'use strict'

const bl = require('bl')

exports = module.exports

exports.setUp = (basePath, blobStore, locks) => {
  const store = blobStore(basePath)
  return {
    get: (callback) => {
      store
        .createReadStream('config')
        .pipe(bl((err, config) => {
          if (err) {
            return callback(err)
          }
          let result
          try {
            result = JSON.parse(config.toString())
          } catch (err) {
            return callback(err)
          }
          callback(null, result)
        }))
    },

    set: (config, callback) => {
      locks.lock((err) => {
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
