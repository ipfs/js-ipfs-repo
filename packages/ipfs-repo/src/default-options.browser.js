import * as MemoryLock from './locks/memory.js'

// Default configuration for a repo in the browser
export default {
  autoMigrate: true,
  onMigrationProgress: () => {},
  repoOwner: true,
  repoLock: MemoryLock
}
