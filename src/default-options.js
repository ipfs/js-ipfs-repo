'use strict'

// Default configuration for a repo in node.js
module.exports = {
  blockStore: require('datastore-fs'),
  dataStore: require('datastore-level'),
  dataStoreOptions: { db: require('leveldown') }
}
