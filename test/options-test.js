/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const rimraf = require('rimraf')
if (!rimraf.sync) {
  // browser
  rimraf.sync = noop
}
const Repo = require('../')

describe('IPFS Repo options Tests', () => {
  const repoPath = path.join(__dirname, 'slash', 'path')
  after(() => {
    rimraf.sync(repoPath)
  })

  it('missing repoPath', () => {
    expect(
      () => new Repo()
    ).to.throw('missing repoPath')
  })

  it('default options', () => {
    const repo = new Repo(repoPath)
    expect(repo.options).to.deep.equal(expectedRepoOptions())
  })
})

function noop () {}

function expectedRepoOptions () {
  const options = {
    // packages are exchanged to browser-compatible
    // equivalents via package.browser.
    fs: require('datastore-fs'),
    level: require('leveldown'),
    lock: process.browser ? 'memory' : 'fs',
    sharding: !process.browser
  }

  if (process.browser) {
    options.fsOptions = {
      db: require('leveldown')
    }
  }

  return options
}
