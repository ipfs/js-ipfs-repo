/* eslint-env mocha */

'use strict'

const expect = require('chai').expect
const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const path = require('path')
const FsBlobStore = require('fs-pull-blob-store')
const MemBlobStore = require('interface-pull-blob-store')

const IPFSRepo = require('../src')

describe('IPFS Repo Tests on Node.js', () => {
  const testConfig = {}

  beforeEach('construct test repo', (done) => {
    const testRepoPath = path.join(__dirname, 'test-repo')
    const date = Date.now().toString()
    testConfig.repoPath = testRepoPath + '-for-' + date

    // copy testdata into our new test repo
    ncp(testRepoPath, testConfig.repoPath, (err) => {
      expect(err).to.not.exist
      done()
    })
  })

  afterEach('teardown test repo', (done) => {
    // cleanup test repo
    rimraf(testConfig.repoPath, (err) => {
      expect(err).to.not.exist
      done()
    })
  })

  describe('single-blockstore', () => {
    beforeEach('instantiate ipfs-repo', () => {
      testConfig.repo = new IPFSRepo(testConfig.repoPath, {stores: FsBlobStore})
    })

    require('./repo-test')(testConfig)
  })

  describe('multi-blockstore', () => {
    beforeEach('instantiate ipfs-repo', () => {
      testConfig.repo = new IPFSRepo(testConfig.repoPath, {
        stores: {
          keys: FsBlobStore,
          config: FsBlobStore,
          blockstore: [FsBlobStore, MemBlobStore],
          logs: FsBlobStore,
          locks: FsBlobStore,
          version: FsBlobStore
        }
      })
    })

    require('./repo-test')(testConfig)
  })
})
