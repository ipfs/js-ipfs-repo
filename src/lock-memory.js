'use strict'

const debug = require('debug')

const log = debug('repo:lock')

const lockFile = 'repo.lock'

const LOCKS = {}

/**
 * Lock the repo in the given dir.
 * TODO
 * @param {string} dir
 * @returns {Promise<Object>}
 */
exports.lock = (dir) => {
  const file = dir + '/' + lockFile
  log('locking %s', file)
  LOCKS[file] = true
  const closer = {
    close () {
      if (LOCKS[file]) {
        delete LOCKS[file]
      }
    }
  }
  return closer
}

/**
 * Check if the repo in the given directory is locked.
 *
 * @param {string} dir
 * @returns {bool}
 */
exports.locked = (dir) => {
  const file = dir + '/' + lockFile
  log('checking lock: %s')

  const locked = LOCKS[file]
  return locked
}
