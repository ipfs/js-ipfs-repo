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

describe('custom options tests', () => {
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

  it('allows for a custom lock', () => {
    const lock = {
      lock: (path, callback) => { },
      locked: (path, callback) => { }
    }

    const repo = new Repo(repoPath, {
      lock
    })

    expect(repo._getLocker()).to.deep.equal(lock)
  })

  it('ensures a custom lock has a .close method', (done) => {
    const lock = {
      lock: (path, callback) => {
        callback(null, {})
      }
    }

    const repo = new Repo(repoPath, {
      lock
    })

    expect(
      () => repo._openLock(repo.path)
    ).to.throw('Locks must have a close method')
    done()
  })
})

function noop () {}

function expectedRepoOptions () {
  const options = {
    lock: process.browser ? 'memory' : 'fs',
    storageBackends: {
      // packages are exchanged to browser-compatible
      // equivalents via package.browser
      root: require('datastore-fs'),
      blocks: require('datastore-fs'),
      keys: require('datastore-fs'),
      datastore: require('datastore-level')
    },
    storageBackendOptions: {
      root: {
        extension: ''
      },
      keys: {},
      blocks: {
        sharding: true,
        extension: '.data'
      }
    }
  }

  if (process.browser) {
    options.storageBackendOptions.root.db = require('leveldown')
    options.storageBackendOptions.keys.db = require('leveldown')
    options.storageBackendOptions.keys.sharding = false
    options.storageBackendOptions.blocks.db = require('leveldown')
    delete options.storageBackendOptions.blocks.extension
    options.storageBackendOptions.blocks.sharding = false
    options.storageBackendOptions.datastore = {
      db: require('leveldown')
    }
  }
  return options
}
