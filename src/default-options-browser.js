'use strict'

// Default configuration for a repo in the browser
module.exports = {
  blockStore: require('datastore-level'),
  blockStoreOptions: { db: require('level-js') },
  dataStore: require('datastore-level'),
  dataStoreOptions: { db: require('level-js') },
  sharding: false
}
