/* eslint-env mocha */

'use strict'

const IPFSRepo = require('../src')

describe('IPFS Repo Tests on the Browser', () => {
  require('./options-test')
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
  require('./datastore-test')(repo)
  require('./keystore-test')(repo)
  require('./lock-test')(repo)
})
