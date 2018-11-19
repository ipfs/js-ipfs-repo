'use strict'

const path = require('path')
const debug = require('debug')
const fs = require('fs')
const { lock, check } = require('proper-lockfile')

const log = debug('repo:lock')

const lockFile = 'repo.lock'

/**
 * Lock the repo in the given dir.
 *
 * @param {string} dir
 * @param {function(Error, lock)} callback
 * @returns {void}
 */
exports.lock = (dir, callback) => {
  const file = path.join(dir, lockFile)
  log('locking %s', file)

  lock(dir, {lockfilePath: file})
    .then(release => {
      callback(null, {close: (cb) => {
        release()
          .then(() => cb())
          .catch(err => cb(err))
      }})
    })
    .catch(err => callback(err))
}

/**
 * Check if the repo in the given directory is locked.
 *
 * @param {string} dir
 * @param {function(Error, bool)} callback
 * @returns {void}
 */
exports.locked = (dir, callback) => {
  const file = path.join(dir, lockFile)
  log('checking lock: %s')

  if (!fs.existsSync(file)) {
    log('file does not exist: %s', file)
  }

  check(dir, { lockfilePath: file })
    .then(islocked => {
      if (islocked) {
        return callback(null, true)
      }
      callback(null, false)
    })
    .catch(err => callback(err))
}
