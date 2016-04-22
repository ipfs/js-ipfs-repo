'use strict'

const stores = require('./stores')

function Repo (repoPath, options) {
  if (!(this instanceof Repo)) {
    return new Repo(repoPath, options)
  }
  if (!options) { throw new Error('missing options param') }
  if (!options.stores) { throw new Error('missing options.stores param') }

  // If options.stores is an abstract-blob-store instead of a map, use it for
  // all stores.
  if (options.stores.prototype && options.stores.prototype.createWriteStream) {
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

  this.path = repoPath

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
}

exports = module.exports = Repo
