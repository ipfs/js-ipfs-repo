/* eslint-env mocha */

'use strict'

const IPFSRepo = require('../src')

async function createTempRepo ({ dontOpen, opts }) {
  const date = Date.now().toString()
  const repoPath = 'test-repo-for-' + date

  const repo = new IPFSRepo(repoPath, opts)
  await repo.init({})

  if (!dontOpen) {
    await repo.open()
  }

  return {
    path: repoPath,
    instance: repo,
    teardown: async () => {
    }
  }
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
})
