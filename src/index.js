'use strict'

const stores = require('./stores')

function Repo (repoPath, options) {
  if (!options) { throw new Error('missing options param') }
  if (!options.stores) { throw new Error('missing options.stores param') }

  // If options.stores is an abstract-blob-store instead of a map, use it for
  // all stores.
  if (options.stores.prototype && options.stores.prototype.createWriteSteam) {
    const store = options.stores
    options.stores = {
      keys: store,
      config: store,
      datastore: store,
      logs: store,
      locks: store,
      version: store
    }
  }

  this.init = (config, callback) => {
    this.exists((err, exists) => {
      if (err) { throw err }
      if (exists) { throw new Error('Repo already exists') }
      throw new Error('not implemented')
    })
  }

  this.locks = stores
                  .locks
                  .setUp(repoPath, options.stores.locks)

  this.exists = (callback) => {
    this.version.exists((err, exists) => {
      if (err) {
        callback(new Error('repo does not exist'), false)
      } else {
        callback(null, exists)
      }
    })
  }

  this.version = stores
                   .version
                   .setUp(repoPath, options.stores.version, this.locks)

  this.config = stores
                .config
                .setUp(repoPath, options.stores.config, this.locks)

  this.keys = stores
                .keys
                .setUp(repoPath, options.stores.keys, this.locks, this.config)

  this.datastore = stores
                .datastore
                .setUp(repoPath, options.stores.datastore, this.locks)

  // TODO: needs https://github.com/ipfs/js-ipfs-repo/issues/6#issuecomment-164650642
  // this.datastoreLegacy = stores
  //              .datastore
  //              .setUp(repoPath, options.stores.datastore, this.locks)

  // TODO: Currently this was also deprecated in go-ipfs
  // this.logs = stores
  //               .logs
  //               .setUp(repoPath, options.stores.logs, this.locks)
}

exports = module.exports = Repo
