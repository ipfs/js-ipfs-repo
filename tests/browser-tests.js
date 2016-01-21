/* globals describe, before */

// const expect = require('chai').expect
const async = require('async')
const store = require('local-storage-blob-store')
const tests = require('./repo-test')
const _ = require('lodash')
const IPFSRepo = require('../src')

var repoContext = require.context('raw!./test-repo', true)

describe('IPFS Repo Testson on the Browser', function () {
  before(function (done) {
    window.localStorage.clear()

    var repoData = []
    repoContext.keys().forEach(function (key) {
      repoData.push({
        key: key.replace('./', ''),
        value: repoContext(key)
      })
    })

    var mainBlob = store('ipfs')
    var blocksBlob = store('ipfs/')

    async.eachSeries(repoData, (file, cb) => {
      if (_.startsWith(file.key, 'datastore/')) {
        return cb()
      }

      const blob = _.startsWith(file.key, 'blocks/')
        ? blocksBlob
        : mainBlob

      blob.createWriteStream({
        key: file.key
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
