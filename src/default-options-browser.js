'use strict'

// Default configuration for a repo in the browser
module.exports = {
  disableAutoMigration: false,
  lock: 'memory',
  storageBackends: {
    root: require('datastore-level'),
    blocks: require('datastore-level'),
    keys: require('datastore-level'),
    datastore: require('datastore-level')
  },
  storageBackendOptions: {
    root: {
      extension: ''
    },
    blocks: {
      sharding: false
    },
    keys: {
      sharding: false
    }
  }
}
