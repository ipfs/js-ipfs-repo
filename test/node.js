/* eslint-env mocha */
'use strict'

const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const path = require('path')
const mkdirp = require('mkdirp')
const series = require('async/series')
const chai = require('chai')
chai.use(require('dirty-chai'))
const os = require('os')

const IPFSRepo = require('../src')

describe('IPFS Repo Tests onNode.js', () => {
  require('./options-test')

  const repos = [{
    name: 'default inited',
    opts: undefined,
    init: true
  }, {
    name: 'memory',
    opts: {
      fs: require('interface-datastore').MemoryDatastore,
      level: require('memdown'),
      lock: 'memory'
    },
    init: true
  }, {
    name: 'default existing',
    opts: undefined,
    init: false
  }]
  repos.forEach((r) => describe(r.name, () => {
    const testRepoPath = path.join(__dirname, 'test-repo')
    const date = Date.now().toString()
    const repoPath = path.join(os.tmpdir(), 'test-repo-for-' + date)

    const repo = new IPFSRepo(repoPath, r.opts)

    before((done) => {
      series([
        (cb) => {
          if (r.init) {
            repo.init({}, cb)
          } else {
            mkdirp.sync(repoPath),
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

    require('./repo-test')(repo)
    require('./blockstore-test')(repo)
    require('./datastore-test')(repo)
    if (!r.init) {
      require('./interop-test')(repo)
    }
  }))
})
