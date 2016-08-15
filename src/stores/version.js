'use strict'

const pull = require('pull-stream')
const series = require('run-series')
const toBuffer = require('safe-buffer').Buffer.from

exports = module.exports

exports.setUp = (basePath, BlobStore, locks) => {
  const store = new BlobStore(basePath)
  const versionFile = 'version'

  return {
    exists (callback) {
      store.exists(versionFile, callback)
    },
    get (callback) {
      pull(
        store.read(versionFile),
        pull.collect((err, values) => {
          if (err) {
            return callback(err)
          }

          const version = Buffer.concat(values).toString('utf8')
          callback(null, version)
        })
      )
    },
    set (value, callback) {
      series([
        (cb) => locks.lock(cb),
        (cb) => {
          const values = [
            Buffer.isBuffer(value) ? value : toBuffer(value)
          ]
          pull(
            pull.values(values),
            store.write(versionFile, cb)
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
