/* globals describe, before, after */

const expect = require('chai').expect
const ncp = require('ncp').ncp
const rimraf = require('rimraf')

const IPFSRepo = require('../src')

describe('IPFS Repo Tests on on Node.js', () => {
  const testRepoPath = __dirname + '/test-repo'
  const date = Date.now().toString()
  const repoPath = testRepoPath + date

  before(done => {
    ncp(testRepoPath, repoPath, err => {
      expect(err).to.not.exist
      done()
    })
  })

  after(done => {
    rimraf(repoPath, err => {
      expect(err).to.not.exist
      done()
    })
  })

  const fs = require('fs-blob-store')
  const options = {
    stores: {
      keys: fs,
      config: fs,
      datastore: fs,
      // datastoreLegacy: needs https://github.com/ipfs/js-ipfs-repo/issues/6#issuecomment-164650642
      logs: fs,
      locks: fs,
      version: fs
    }
  }
  const repo = new IPFSRepo(repoPath, options)
  require('./repo-test')(repo)
})
