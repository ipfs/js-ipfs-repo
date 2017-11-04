'use strict'

const Key = require('interface-datastore').Key
const debug = require('debug')
const log = debug('repo:version')

const versionKey = new Key('version')

module.exports = (store) => {
  return {
    /**
     * Check if a version file exists.
     *
     * @param {function(Error, bool)} callback
     * @returns {void}
     */
    exists (callback) {
      store.has(versionKey, callback)
    },
    /**
     * Get the current version.
     *
     * @param {function(Error, number)} callback
     * @returns {void}
     */
    get (callback) {
      store.get(versionKey, (err, buf) => {
        if (err) {
          return callback(err)
        }
        callback(null, parseInt(buf.toString().trim(), 10))
      })
    },
    /**
     * Set the version of the repo, writing it to the underlying store.
     *
     * @param {number} version
     * @param {function(Error)} callback
     * @returns {void}
     */
    set (version, callback) {
      store.put(versionKey, Buffer.from(String(version)), callback)
    },
    /**
     * Check the current version, and return an error on missmatch
     * @param {number} expected
     * @param {function(Error)} callback
     * @returns {void}
     */
    check (expected, callback) {
      this.get((err, version) => {
        if (err) {
          return callback(err)
        }
        log('comparing version: %s and %s', version, expected)
        if (version !== expected) {
          return callback(new Error(`version mismatch: expected v${expected}, found v${version}`))
        }
        callback()
      })
    }
  }
}
