'use strict'

const debug = require('debug')

const log = debug('repo:lock')

const lockFile = 'repo.lock'

const LOCKS = {}

/**
 * Lock the repo in the given dir.
 *
 * @param {string} dir
 * @returns {Promise<Object>}
 */
exports.lock = async (dir) => { // eslint-disable-line require-await
  const file = dir + '/' + lockFile
  log('locking %s', file)
  LOCKS[file] = true
  const closer = {
    async close () { // eslint-disable-line require-await
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
exports.locked = async (dir) => { // eslint-disable-line require-await
  const file = dir + '/' + lockFile
  log(`checking lock: ${file}`)

  return Boolean(LOCKS[file])
}
