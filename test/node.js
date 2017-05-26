/* eslint-env mocha */
'use strict'

const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const path = require('path')
const series = require('async/series')
const os = require('os')
const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const IPFSRepo = require('../src')

describe('IPFS Repo Tests on on Node.js', () => {
  const repos = [{
    name: 'default',
    opts: undefined,
    init: false
  }, {
    name: 'memory',
    opts: {
      blockStore: require('interface-datastore').MemoryDatastore,
      dataStore: require('interface-datastore').MemoryDatastore
      // dataStore: require('memdown')
    },
    init: true
  }]
  repos.forEach((r) => describe(r.name, () => {
    const testRepoPath = path.join(__dirname, 'test-repo')
    const date = Date.now().toString()
    const repoPath = testRepoPath + '-for-' + date

    const repo = new IPFSRepo(repoPath, r.opts)

    before((done) => {
      series([
        (cb) => {
          if (r.init) {
            repo.init({}, cb)
          } else {
            ncp(testRepoPath, repoPath, cb)
          }
        },
        (cb) => repo.open(cb)
      ], done)
    })

    after((done) => {
      series([
        (cb) => repo.close(cb),
        (cb) => rimraf(repoPath, cb)
      ], done)
    })

    it('init', (done) => {
      const dir = path.join(os.tmpdir(), String(Math.random()).slice(2))
      const r = new IPFSRepo(dir)

      series([
        (cb) => r.init({hello: 'world'}, cb),
        (cb) => r.open(cb),
        (cb) => r.config.get((err, val) => {
          expect(err).to.not.exist()
          expect(val).to.be.eql({hello: 'world'})
          cb()
        }),
        (cb) => r.close(cb),
        (cb) => rimraf(dir, cb)
      ], done)
    })

    require('./repo-test')(repo)
    require('./blockstore-test')(repo)
    require('./datastore-test')(repo)
    if (!r.init) {
      require('./interop-test')(repo)
    }
  }))
})
