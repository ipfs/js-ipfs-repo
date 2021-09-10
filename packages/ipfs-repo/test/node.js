/* eslint-env mocha */

import { loadCodec } from './fixtures/load-codec.js'
import * as MemoryLock from '../src/locks/memory.js'
import { createBackend } from './fixtures/create-backend.js'
import optionsTests from './options-test.js'
import migrationsTests from './migrations-test.js'
import repoTests from './repo-test.js'
import blockstoreTests from './blockstore-test.js'
import datastoreTests from './datastore-test.js'
import keystoreTests from './keystore-test.js'
import statTests from './stat-test.js'
import lockTests from './lock-test.js'
import configTests from './config-test.js'
import apiAddrTests from './api-addr-test.js'
import pinsTests from './pins-test.js'
import isInitializedTests from './is-initialized.js'
import blockstoreUtilsTests from './blockstore-utils-test.js'

/**
 * @typedef {import('multiformats/codecs/interface').BlockCodec<any, any>} BlockCodec
 * @typedef {import('../src/types').Options} Options
 */

import { createRepo } from '../src/index.js'

/**
 * @param {Partial<Options>} [options]
 */
async function createTempRepo (options = {}) {
  const repo = createRepo(`/foo-${Math.random()}`, loadCodec, createBackend(), {
    ...options,
    repoLock: MemoryLock
  })
  await repo.init({})
  await repo.open()
  return repo
}

describe('IPFS Repo Tests onNode.js', () => {
  optionsTests()
  migrationsTests(createTempRepo)

  /**
   * @type {Array<{name: string, opts?: Options}>}
   */
  const repos = [
    {
      name: 'default inited',
      opts: undefined
    },
    {
      name: 'memory',
      opts: {
        autoMigrate: true,
        onMigrationProgress: () => {},
        repoOwner: true,
        repoLock: MemoryLock
      }
    }
  ]
  repos.forEach((r) => describe(r.name, () => {
    const repo = createRepo(`repo-${Math.random()}`, loadCodec, createBackend(), {
      repoLock: MemoryLock,
      ...(r.opts || {})
    })

    before(async () => {
      await repo.init({})
      await repo.open()
    })

    after(async () => {
      await repo.close()
    })

    repoTests(repo)
    blockstoreTests(repo)
    datastoreTests(repo)
    keystoreTests(repo)
    statTests(repo)
    lockTests(repo)
    configTests(repo)
    apiAddrTests()
    pinsTests(repo)
    isInitializedTests()
  }))

  blockstoreUtilsTests()
})
