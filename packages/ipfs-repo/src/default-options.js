import * as FsLock from './locks/fs.js'

// Default configuration for a repo in node.js

/**
 * @type {Partial<import('./types').Options>}
 */
export default {
  autoMigrate: true,
  onMigrationProgress: () => {},
  repoOwner: true,
  repoLock: FsLock
}
