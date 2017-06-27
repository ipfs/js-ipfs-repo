'use strict'

// Default configuration for a repo in the browser
module.exports = {
  fs: require('datastore-level'),
  sharding: false,
  lock: 'memory',
  fsOptions: {
    db: require('level-js')
  },
  level: require('level-js')
}
