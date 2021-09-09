'use strict'

// Default configuration for a repo in node.js

/**
 * @type {Partial<import('./types').Options>}
 */
const defaultOptions = {
  autoMigrate: true,
  onMigrationProgress: () => {},
  repoOwner: true,
  repoLock: require('./locks/fs')
}

module.exports = defaultOptions
