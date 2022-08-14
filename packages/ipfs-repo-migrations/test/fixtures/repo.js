import loadFixture from 'aegir/fixtures'
import { CONFIG_KEY, VERSION_KEY } from '../../src/utils.js'
import fs from 'fs/promises'

/**
 * @typedef {import('../../src/types').Backends} Backends
 * @typedef {import('../types').SetupOptions} SetupOptions
 * @typedef {import('../types').CreateBackends} CreateBackends
 */

/**
 * @param {CreateBackends} createBackends
 * @param {SetupOptions} [opts]
 */
export async function createRepo (createBackends, opts = {}) {
  let dir = opts.dir
  const prefix = opts.prefix ?? ''

  if (dir == null) {
    dir = [prefix, `test-repo-for-${Date.now()}`].filter(Boolean).join('/')
    await fs.mkdir(dir, {
      recursive: true
    })
  }

  const backends = createBackends(dir, opts.createBackends)
  await backends.root.open()
  await backends.root.close()

  return {
    dir,
    prefix,
    backends
  }
}

/**
 * @param {Backends} backends
 */
export async function initRepo (backends) {
  const store = backends.root
  await store.open()
  await store.put(VERSION_KEY, loadFixture('test/fixtures/test-repo/version'))
  await store.put(CONFIG_KEY, loadFixture('test/fixtures/test-repo/config'))
  await store.close()
}
