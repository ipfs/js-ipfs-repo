/* eslint-env mocha */

'use strict'

const series = require('async/series')
const Store = require('idb-pull-blob-store')
const _ = require('lodash')
const pull = require('pull-stream')

const IPFSRepo = require('../src')
const tests = require('./repo-test')

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

    const mainBlob = new Store('ipfs')
    const blocksBlob = new Store('ipfs/blocks')

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

  const repo = new IPFSRepo('ipfs', {stores: Store})
  tests(repo)
})
