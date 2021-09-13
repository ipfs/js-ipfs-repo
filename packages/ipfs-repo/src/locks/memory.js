
import { LockExistsError } from '../errors.js'
import debug from 'debug'

const log = debug('ipfs:repo:lock:memory')
const lockFile = 'repo.lock'

/** @type {Record<string,boolean>} */
const LOCKS = {}

/**
 * @typedef {import('../types').LockCloser} LockCloser
 */

/**
 * Lock the repo in the given dir.
 *
 * @param {string} dir
 * @returns {Promise<LockCloser>}
 */
async function lock (dir) {
  const file = dir + '/' + lockFile
  log('locking %s', file)

  if (LOCKS[file] === true) {
    throw new LockExistsError(`Lock already being held for file: ${file}`)
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
async function locked (dir) {
  const file = dir + '/' + lockFile
  log(`checking lock: ${file}`)

  return Boolean(LOCKS[file])
}

export const MemoryLock = {
  lock,
  locked
}
