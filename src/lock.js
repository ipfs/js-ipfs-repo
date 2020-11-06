'use strict'

const { LockExistsError } = require('./errors')
const path = require('path')
const debug = require('debug')
const { lock } = require('proper-lockfile')

const log = debug('ipfs:repo:lock')
const lockFile = 'repo.lock'

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
 * @returns {Promise<Object>}
 */
exports.lock = async (dir) => {
  const file = path.join(dir, lockFile)
  log('locking %s', file)
  let release
  try {
    release = await lock(dir, { lockfilePath: file, stale: STALE_TIME })
  } catch (err) {
    if (err.code === 'ELOCKED') {
      throw new LockExistsError(`Lock already being held for file: ${file}`)
    } else {
      throw err
    }
  }
  return {
    close: async () => { // eslint-disable-line require-await
      release()
    }
  }
}
