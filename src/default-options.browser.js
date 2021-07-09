'use strict'

// Default configuration for a repo in the browser
module.exports = {
  autoMigrate: true,
  onMigrationProgress: () => {},
  repoOwner: true,
  repoLock: require('./locks/memory')
}
