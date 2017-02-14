/* eslint-env mocha */

'use strict'

const series = require('async/series')
const IdbStore = require('idb-pull-blob-store')
const MemBlobStore = require('interface-pull-blob-store')
const _ = require('lodash')
const pull = require('pull-stream')

const IPFSRepo = require('../src')
const tests = require('./repo-test')

const repoContext = require.context('buffer!./test-repo', true)

const idb = self.indexedDB ||
        self.mozIndexedDB ||
        self.webkitIndexedDB ||
        self.msIndexedDB

idb.deleteDatabase('ipfs')
idb.deleteDatabase('ipfs/blocks')

describe('IPFS Repo Tests on the Browser', () => {
  const testConfig = {}

  beforeEach((done) => {
    const repoData = []
    repoContext.keys().forEach((key) => {
      repoData.push({
        key: key.replace('./', ''),
        value: repoContext(key)
      })
    })

    const mainBlob = new IdbStore('ipfs')
    const blocksBlob = new IdbStore('ipfs/blocks')

    series(repoData.map((file) => (cb) => {
      if (_.startsWith(file.key, 'datastore/')) {
        return cb()
      }

      const blocks = _.startsWith(file.key, 'blocks/')
      const blob = blocks ? blocksBlob : mainBlob

      const key = blocks ? file.key.replace(/^blocks\//, '') : file.key

      pull(
        pull.values([file.value]),
        blob.write(key, cb)
      )
    }), done)
  })

  describe('single-blockstore', () => {
    beforeEach('instantiate ipfs-repo', () => {
      testConfig.repo = new IPFSRepo('ipfs', {stores: IdbStore})
    })

    tests(testConfig)
  })

  describe('multi-blockstore', () => {
    beforeEach('instantiate ipfs-repo', () => {
      testConfig.repo = new IPFSRepo('ipfs', {
        stores: {
          keys: IdbStore,
          config: IdbStore,
          blockstore: [IdbStore, MemBlobStore],
          logs: IdbStore,
          locks: IdbStore,
          version: IdbStore
        }
      })
    })

    tests(testConfig)
  })
})
