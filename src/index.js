const stores = require('./stores')

exports = module.exports = Repo

function Repo (repoPath, options) {
  if (!options) { throw new Error('missing options param') }
  if (!options.stores) { throw new Error('missing options.stores param') }

  // If options.stores is an abstract-blob-store instead of a map, use it for
  // all stores.
  if (options.stores.prototype && options.stores.prototype.createWriteSteam) {
    var store = options.stores
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
    if (this.exists()) {
      throw new Error('Repo already exists')
    }
  }

  this.locks = stores
                  .locks
                  .setUp(repoPath, options.stores.locks)

  this.exists = callback => {
    this.version.get((err, version) => {
      if (err) {
        return callback(new Error('Repo does not exist'))
      }
      callback(null, true)
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
