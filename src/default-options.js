'use strict'

// Default configuration for a repo in node.js

/**
 * @type {Required<import('./types').Options>}
 */
module.exports = {
  autoMigrate: true,
  onMigrationProgress: () => {},
  lock: 'fs',
  storageBackends: {
    root: require('datastore-fs'),
    blocks: require('datastore-fs'),
    keys: require('datastore-fs'),
    datastore: require('datastore-level'),
    pins: require('datastore-level')
  },
  storageBackendOptions: {
    root: {
      extension: ''
    },
    blocks: {
      sharding: true,
      extension: '.data'
    },
    keys: {
    }
  }
}
