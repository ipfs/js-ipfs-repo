'use strict'

const pull = require('pull-stream')
const series = require('run-series')

exports = module.exports

exports.setUp = (basePath, BlobStore, locks) => {
  const store = new BlobStore(basePath)
  const configFile = 'config'

  return {
    get (callback) {
      pull(
        store.read(configFile),
        pull.collect((err, values) => {
          if (err) {
            return callback(err)
          }

          const config = Buffer.concat(values)
          let result
          try {
            result = JSON.parse(config.toString())
          } catch (err) {
            return callback(err)
          }

          callback(null, result)
        })
      )
    },

    set (config, callback) {
      series([
        (cb) => locks.lock(cb),
        (cb) => {
          pull(
            pull.values([
              new Buffer(JSON.stringify(config, null, 2))
            ]),
            store.write(configFile, cb)
          )
        }
      ], (err) => {
        locks.unlock((err2) => {
          callback(err || err2)
        })
      })
    }
  }
}
