/* eslint-env mocha */

import { createRepo } from '../src/index.js'
import { loadCodec } from './fixtures/load-codec.js'
import { MemoryDatastore } from 'datastore-core/memory'
import { MemoryBlockstore } from 'blockstore-core/memory'
import optionsTests from './options-test.js'
import migrationsTests from './migrations-test.js'
import repoTests from './repo-test.js'
import blockstoreTests from './blockstore-test.js'
import datastoreTests from './datastore-test.js'
import keystoreTests from './keystore-test.js'
import lockTests from './lock-test.js'
import configTests from './config-test.js'
import apiAddrTests from './api-addr-test.js'
import pinsTests from './pins-test.js'
import isInitializedTests from './is-initialized.js'
import blockstoreUtilsTests from './blockstore-utils-test.js'

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
  optionsTests()
  migrationsTests(createTempRepo)

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

  repoTests(repo)
  blockstoreTests(repo)
  blockstoreUtilsTests()
  datastoreTests(repo)
  keystoreTests(repo)
  configTests(repo)
  apiAddrTests()
  lockTests(repo)
  pinsTests(repo)
  isInitializedTests()
})
