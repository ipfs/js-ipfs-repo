var stores = require('./stores')
var extend = require('xtend')
var fs = require('fs-blob-store')

exports = module.exports = Repo

function Repo (repoPath, options) {
  var self = this
  var base = {
    stores: {
      keys: fs,
      config: fs,
      datastore: fs,
      // datastoreLegacy: needs https://github.com/ipfs/js-ipfs-repo/issues/6#issuecomment-164650642
      logs: fs,
      locks: fs,
      version: fs
    }
  }
  options = extend(base, options)

  self.exists = function () {
    try {
      return !!fs.statSync(this.repoPath)
    } catch (err) {
      return false
    }
  }

  self.init = function (config, callback) {
    if (this.exists()) {
      throw new Error('Repo already exists')
    }

    // TODO
    // 1. load remaining stores
    // 2. init all of them
  }

  self.locks = require('./stores').locks.setUp(repoPath, options.stores.locks)

  self.exists = function (callback) {
    self.version.get(function (err, version) {
      if (err) {
        return callback(new Error('Repo does not exist'))
      }
      callback(null, true)
    })
  }

  self.version = stores
                   .version
                   .setUp(repoPath, options.stores.version, self.locks)

  self.config = stores
                .config
                .setUp(repoPath, options.stores.config, self.locks)

  // TODO
  // self.keys = stores
  //              .keys
  //              .setUp(repoPath, options.stores.keys, self.locks)

  // TODO
  // self.datastore = stores
  //              .datastore
  //              .setUp(repoPath, options.stores.datastore, self.locks)

  // TODO: needs https://github.com/ipfs/js-ipfs-repo/issues/6#issuecomment-164650642
  // self.datastoreLegacy = stores
  //              .datastore
  //              .setUp(repoPath, options.stores.datastore, self.locks)

  // TODO: Currently this was also deprecated in go-ipfs
  // self.logs = stores
  //               .logs
  //               .setUp(repoPath, options.stores.logs, self.locks)
}
