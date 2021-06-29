/* eslint-env mocha */

'use strict'

const { createRepo } = require('../src')
const loadCodec = require('./fixtures/load-codec')
const { MemoryDatastore } = require('interface-datastore')
const { MemoryBlockstore } = require('interface-blockstore')

async function createTempRepo (options = {}) {
  const date = Date.now().toString()
  const repoPath = 'test-repo-for-' + date

  const repo = createRepo(repoPath, loadCodec, {
    blocks: new MemoryBlockstore(),
    datastore: new MemoryDatastore(),
    root: new MemoryDatastore(),
    keys: new MemoryDatastore(),
    pins: new MemoryDatastore()
  }, options)
  await repo.init({})
  await repo.open()

  return repo
}

describe('IPFS Repo Tests on the Browser', () => {
  require('./options-test')
  require('./migrations-test')(createTempRepo)

  const repo = createRepo('myrepo', loadCodec, {
    blocks: new MemoryBlockstore(),
    datastore: new MemoryDatastore(),
    root: new MemoryDatastore(),
    keys: new MemoryDatastore(),
    pins: new MemoryDatastore()
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
  require('./blockstore-utils-test')()
  require('./datastore-test')(repo)
  require('./keystore-test')(repo)
  require('./config-test')(repo)
  require('./api-addr-test')()
  require('./lock-test')(repo)
  require('./pins-test')(repo)
  require('./is-initialized')
})
