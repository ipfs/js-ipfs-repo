'use strict'

// Default configuration for a repo in the browser
module.exports = {
  lock: 'memory',
  storageBackends: {
    root: require('datastore-level'),
    blocks: require('datastore-level'),
    keys: require('datastore-level'),
    datastore: require('datastore-level')
  },
  storageBackendOptions: {
    root: {
      db: require('level-js'),
      extension: ''
    },
    blocks: {
      sharding: false,
      db: require('level-js')
    },
    keys: {
      sharding: false,
      db: require('level-js')
    },
    datastore: {
      db: require('level-js')
    }
  }
}
