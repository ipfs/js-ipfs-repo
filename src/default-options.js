'use strict'

// Default configuration for a repo in node.js
module.exports = {
  fs: require('datastore-fs'),
  level: require('leveldown'),
  sharding: true
}
