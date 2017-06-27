'use strict'

// Default configuration for a repo in node.js
module.exports = {
  sharding: true,
  lock: 'fs',
  fs: require('datastore-fs'),
  level: require('leveldown')
}
