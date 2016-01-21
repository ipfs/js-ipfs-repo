const stores = require('./stores')

exports = module.exports = Repo

function Repo (repoPath, options) {
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
