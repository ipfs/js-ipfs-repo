'use strict'

const loadFixture = require('aegir/utils/fixtures')
const { CONFIG_KEY, VERSION_KEY } = require('../../src/utils')

/**
 * @typedef {import('../../src/types').Backends} Backends
 */

/**
 *
 * @param {(dir: string) => import('../../src/types').Backends} createBackends
 * @param {*} prefix
 * @returns
 */
async function createRepo (createBackends, prefix) {
  const dir = `${prefix ? `${prefix}/` : ''}test-repo-for-${Date.now()}`
  const backends = createBackends(dir)

  await backends.root.open()
  await backends.root.close()

  return {
    dir,
    backends
  }
}

/**
 * @param {Backends} backends
 */
async function initRepo (backends) {
  const store = backends.root
  await store.open()
  await store.put(VERSION_KEY, loadFixture('test/fixtures/test-repo/version'))
  await store.put(CONFIG_KEY, loadFixture('test/fixtures/test-repo/config'))
  await store.close()
}

module.exports = {
  createRepo,
  initRepo
}
