import { MemoryLock } from './locks/memory.js'

/**
 * @type {Partial<import('./types').Options>}
 */
export default {
  autoMigrate: true,
  onMigrationProgress: () => {},
  repoOwner: true,
  repoLock: MemoryLock
}
