
import debug from 'debug'
import { CONFIG_KEY, VERSION_KEY } from '../utils.js'
import { MissingRepoOptionsError } from '../errors.js'

const log = debug('ipfs:repo:migrator:repo:init')

/**
 * @param {import('../types').Backends} backends
 */
export async function isRepoInitialized (backends) {
  if (!backends) {
    throw new MissingRepoOptionsError('Please pass repo options when trying to open a repo')
  }

  const root = backends.root

  try {
    await root.open()
    const versionCheck = await root.has(VERSION_KEY)
    const configCheck = await root.has(CONFIG_KEY)
    if (!versionCheck || !configCheck) {
      log(`Version entry present: ${versionCheck}`)
      log(`Config entry present: ${configCheck}`)
      return false
    }

    return true
  } catch (/** @type {any} */ e) {
    log('While checking if repo is initialized error was thrown: ' + e.message)
    return false
  } finally {
    if (root !== undefined) {
      try {
        await root.close()
      } catch {}
    }
  }
}
