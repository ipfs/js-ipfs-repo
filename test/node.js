/* eslint-env mocha */
'use strict'

const loadCodec = require('./fixtures/load-codec')
const MemoryLock = require('../src/locks/memory')
const createBackend = require('./fixtures/create-backend')

/**
 * @typedef {import('multiformats/codecs/interface').BlockCodec<any, any>} BlockCodec
 * @typedef {import('../src/types').Options} Options
 */

const { createRepo } = require('../src')

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
  require('./options-test')
  require('./migrations-test')(createTempRepo)

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

    require('./repo-test')(repo)
    require('./blockstore-test')(repo)
    require('./datastore-test')(repo)
    require('./keystore-test')(repo)
    require('./stat-test')(repo)
    require('./lock-test')(repo)
    require('./config-test')(repo)
    require('./api-addr-test')()
    require('./pins-test')(repo)
    require('./is-initialized')
  }))

  require('./blockstore-utils-test')()
})
