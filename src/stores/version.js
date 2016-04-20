'use strict'

const bl = require('bl')

exports = module.exports

exports.setUp = (basePath, blobStore, locks) => {
  const store = blobStore(basePath)

  return {
    exists: (callback) => {
      store.exists('version', callback)
    },
    get: (callback) => {
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
      locks.lock((err) => {
        if (err) {
          return callback(err)
        }

        store.createWriteStream('version')
          .once('finish', () => {
            locks.unlock(callback)
          })
          .end(value)
      })
    }
  }
}
