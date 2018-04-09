/* eslint-env mocha */
'use strict'

const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const fs = require('fs')
const path = require('path')
const series = require('async/series')
const chai = require('chai')
chai.use(require('dirty-chai'))

const IPFSRepo = require('../src')

describe('IPFS Repo Tests onNode.js', () => {
  require('./options-test')

  const customLock = {
    lockName: 'test.lock',
    lock: (dir, callback) => {
      customLock.locked(dir, (err, isLocked) => {
        if (err || isLocked) {
          return callback(new Error('already locked'))
        }

        let lockPath = path.join(dir, customLock.lockName)
        fs.writeFileSync(lockPath, '')

        callback(null, {
          close: (cb) => {
            rimraf(lockPath, cb)
          }
        })
      })
    },
    locked: (dir, callback) => {
      fs.stat(path.join(dir, customLock.lockName), (err, stats) => {
        if (err) {
          callback(null, false)
        } else {
          callback(null, true)
        }
      })
    }
  }

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
    name: 'custom locker',
    opts: {
      lock: customLock
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

    require('./repo-test')(repo)
    require('./blockstore-test')(repo)
    require('./datastore-test')(repo)
    require('./keystore-test')(repo)
    require('./stat-test')(repo)
    require('./lock-test')(repo)
    if (!r.init) {
      require('./interop-test')(repo)
    }
  }))
})
