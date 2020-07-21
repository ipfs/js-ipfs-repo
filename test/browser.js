/* eslint-env mocha */

'use strict'

const IPFSRepo = require('../src')

async function createTempRepo (options = {}) {
  const date = Date.now().toString()
  const repoPath = 'test-repo-for-' + date

  const repo = new IPFSRepo(repoPath, options)
  await repo.init({})
  await repo.open()

  return repo
}

describe('IPFS Repo Tests on the Browser', () => {
  require('./options-test')
  require('./migrations-test')(createTempRepo)

  const repo = new IPFSRepo('myrepo')

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
  require('./api-addr-test')(repo)
  require('./lock-test')(repo)
  require('./pins-test')(repo)
  require('./is-initialized')
})
