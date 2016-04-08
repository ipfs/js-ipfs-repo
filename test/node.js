/* eslint-env mocha */

'use strict'

const expect = require('chai').expect
const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const path = require('path')

const IPFSRepo = require('../src')

describe('IPFS Repo Tests on on Node.js', () => {
  const testRepoPath = path.join(__dirname, 'test-repo')
  const date = Date.now().toString()
  const repoPath = testRepoPath + '-for-' + date

  before((done) => {
    ncp(testRepoPath, repoPath, (err) => {
      expect(err).to.not.exist
      done()
    })
  })

  after((done) => {
    rimraf(repoPath, (err) => {
      expect(err).to.not.exist
      done()
    })
  })

  const fs = require('fs-blob-store')
  const repo = new IPFSRepo(repoPath, {stores: fs})
  require('./repo-test')(repo)
})
