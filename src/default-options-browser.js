'use strict'

// Default configuration for a repo in the browser
module.exports = {
  lock: 'memory',
  storageBackends: {
    root: require('datastore-idb'),
    blocks: require('datastore-idb'),
    keys: require('datastore-idb'),
    datastore: require('datastore-idb')
  },
  storageBackendOptions: {
    root: {
      extension: '',
      prefix: '',
      version: 2
    },
    blocks: {
      sharding: false,
      prefix: '',
      version: 2
    },
    keys: {
      sharding: false,
      prefix: '',
      version: 2
    },
    datastore: {
      sharding: false,
      prefix: '',
      version: 2
    }
  }
}
