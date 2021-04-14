'use strict'

const errors = require('./errors')
const debug = require('debug')

const log = debug('ipfs:repo:lock')

const lockFile = 'repo.lock'

/** @type {Record<string,boolean>} */
const LOCKS = {}

/**
 * @typedef {import('./types').LockCloser} LockCloser
 */

/**
 * Lock the repo in the given dir.
 *
 * @param {string} dir
 * @returns {Promise<LockCloser>}
 */
exports.lock = async (dir) => {
  const file = dir + '/' + lockFile
  log('locking %s', file)

  if (LOCKS[file] === true) {
    throw new errors.LockExistsError(`Lock already being held for file: ${file}`)
  }

  LOCKS[file] = true
  const closer = {
    async close () {
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
 * @returns {Promise<boolean>}
 */
exports.locked = async (dir) => {
  const file = dir + '/' + lockFile
  log(`checking lock: ${file}`)

  return Boolean(LOCKS[file])
}
