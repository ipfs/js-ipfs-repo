/* eslint-env mocha */

'use strict'

const series = require('async/series')

const IPFSRepo = require('../src')

describe('IPFS Repo Tests on the Browser', () => {
  require('./options-test')
  const repo = new IPFSRepo('myrepo')

  before((done) => {
    series([
      (cb) => repo.init({}, cb),
      (cb) => repo.open(cb)
    ], done)
  })

  after((done) => {
    repo.close(done)
  })

  require('./repo-test')(repo)
  require('./blockstore-test')(repo)
  require('./datastore-test')(repo)
})
