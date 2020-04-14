/* eslint-env mocha */
'use strict'

const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const os = require('os')
const { LockExistsError } = require('../src/errors')

const chai = require('chai')
chai.use(require('dirty-chai'))

const asyncRimraf = promisify(rimraf)
const asyncNcp = promisify(ncp)
const fsstat = promisify(fs.stat)

const IPFSRepo = require('../src')

async function createTempRepo (options = {}) {
  const date = Date.now().toString()
  const repoPath = path.join(os.tmpdir(), 'test-repo-for-' + date)
  await asyncNcp(path.join(__dirname, 'test-repo'), repoPath)
  const repo = new IPFSRepo(repoPath, options)
  await repo.open()
  return repo
}

describe('IPFS Repo Tests onNode.js', () => {
  require('./options-test')
  require('./migrations-test')(createTempRepo)

  const customLock = {
    lockName: 'test.lock',
    lock: async (dir) => {
      const isLocked = await customLock.locked(dir)
      if (isLocked) {
        throw new LockExistsError('already locked')
      }
      const lockPath = path.join(dir, customLock.lockName)
      fs.writeFileSync(lockPath, '')
      return {
        close: () => asyncRimraf(lockPath)
      }
    },
    locked: async (dir) => {
      try {
        await fsstat(path.join(dir, customLock.lockName))
        return true
      } catch (err) {
        return false
      }
    }
  }

  const repos = [
    {
      name: 'default inited',
      opts: undefined,
      init: true
    },
    {
      name: 'memory',
      opts: {
        fs: require('interface-datastore').MemoryDatastore,
        level: require('memdown'),
        lock: 'memory'
      },
      init: true
    },
    {
      name: 'custom locker',
      opts: {
        lock: customLock
      },
      init: true
    },
    {
      name: 'default existing',
      opts: undefined,
      init: false
    }
  ]
  repos.forEach((r) => describe(r.name, () => {
    const testRepoPath = path.join(__dirname, 'test-repo')
    const date = Date.now().toString()
    const repoPath = path.join(os.tmpdir(), 'test-repo-for-' + date)

    const repo = new IPFSRepo(repoPath, r.opts)

    before(async () => {
      if (r.init) {
        await repo.init({})
      } else {
        await asyncNcp(testRepoPath, repoPath)
      }
      await repo.open()
    })

    after(async () => {
      await repo.close()
      await asyncRimraf(repoPath)
    })

    require('./repo-test')(repo)
    require('./blockstore-test')(repo)
    require('./datastore-test')(repo)
    require('./keystore-test')(repo)
    require('./stat-test')(repo)
    require('./lock-test')(repo)
    require('./config-test')(repo)
    require('./api-addr-test')(repo)
    if (!r.init) {
      require('./interop-test')(repo)
    }
    require('./is-initialized')
  }))

  require('./blockstore-utils-test')()
})
