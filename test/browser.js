/* eslint-env mocha */

'use strict'

const async = require('async')
const store = require('idb-plus-blob-store')
const tests = require('./repo-test')
const _ = require('lodash')
const IPFSRepo = require('../src')

const repoContext = require.context('buffer!./test-repo', true)

const idb = window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB

idb.deleteDatabase('ipfs')
idb.deleteDatabase('ipfs/blocks')

// TODO use arrow funtions again when https://github.com/webpack/webpack/issues/1944 is fixed
describe('IPFS Repo Tests on the Browser', function () {
  before(function (done) {
    const repoData = []
    repoContext.keys().forEach(function (key) {
      repoData.push({
        key: key.replace('./', ''),
        value: repoContext(key)
      })
    })

    const mainBlob = store('ipfs')
    const blocksBlob = store('ipfs/blocks')

    async.eachSeries(repoData, (file, cb) => {
      if (_.startsWith(file.key, 'datastore/')) {
        return cb()
      }

      const blocks = _.startsWith(file.key, 'blocks/')
      const blob = blocks ? blocksBlob : mainBlob

      const key = blocks ? file.key.replace(/^blocks\//, '') : file.key

      blob.createWriteStream({
        key: key
      }).end(file.value, cb)
    }, done)
  })

  const options = {
    stores: {
      keys: store,
      config: store,
      datastore: store,
      // datastoreLegacy: needs https://github.com/ipfs/js-ipfs-repo/issues/6#issuecomment-164650642
      logs: store,
      locks: store,
      version: store
    }
  }
  const repo = new IPFSRepo('ipfs', options)
  tests(repo)
})
