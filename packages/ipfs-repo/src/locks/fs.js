import { LockExistsError } from '../errors.js'
import path from 'path'
import debug from 'debug'
import { lock as properLock, check } from 'proper-lockfile'

const log = debug('ipfs:repo:lock:fs')
const lockFile = 'repo.lock'

/**
 * @typedef {import('../types').LockCloser} LockCloser
 */

/**
 * Duration in milliseconds in which the lock is considered stale
 *
 * @see https://github.com/moxystudio/node-proper-lockfile#lockfile-options
 * The default value of 10000 was too low for ipfs and sometimes `proper-lockfile`
 * would throw an exception because it couldn't update the lock file mtime within
 * the 10s threshold. @see https://github.com/ipfs/js-ipfs-repo/pull/182
 * Increasing to 20s is a temporary fix a permanent fix should be implemented in
 * the future.
 */
const STALE_TIME = 20000

/**
 * Lock the repo in the given dir.
 *
 * @param {string} dir
 * @returns {Promise<LockCloser>}
 */
const lock = async (dir) => {
  const file = path.join(dir, lockFile)
  log('locking %s', file)
  let release
  try {
    release = await properLock(dir, { lockfilePath: file, stale: STALE_TIME })
  } catch (/** @type {any} */ err) {
    if (err.code === 'ELOCKED') {
      throw new LockExistsError(`Lock already being held for file: ${file}`)
    } else {
      throw err
    }
  }
  return {
    close: release
  }
}

/**
 * Check if the repo in the given directory is locked.
 *
 * @param {string} dir
 * @returns {Promise<boolean>}
 */
const locked = (dir) => {
  const file = path.join(dir, lockFile)

  return check(dir, { lockfilePath: file, stale: STALE_TIME })
}

export const FSLock = {
  lock,
  locked
}
