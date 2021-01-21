'use strict'

// Default configuration for a repo in node.js

/**
 * @type {import("./types").InternalOptions}
 */
module.exports = {
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
