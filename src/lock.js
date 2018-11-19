'use strict'

const path = require('path')
const debug = require('debug')
const { lock } = require('proper-lockfile')

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
