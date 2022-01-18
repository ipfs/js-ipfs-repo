import { migration as migration8 } from './migration-8/index.js'
import { migration as migration9 } from './migration-9/index.js'
import { migration as migration10 } from './migration-10/index.js'
import { migration as migration11 } from './migration-11/index.js'
import { migration as migration12 } from './migration-12/index.js'

/**
 * @type {import('../src/types').Migration}
 */
const emptyMigration = {
  description: 'Empty migration.',
  // @ts-ignore
  migrate: () => {},
  // @ts-ignore
  revert: () => {},
  empty: true
}

export default [
  Object.assign({ version: 1 }, emptyMigration),
  Object.assign({ version: 2 }, emptyMigration),
  Object.assign({ version: 3 }, emptyMigration),
  Object.assign({ version: 4 }, emptyMigration),
  Object.assign({ version: 5 }, emptyMigration),
  Object.assign({ version: 6 }, emptyMigration),
  Object.assign({ version: 7 }, emptyMigration),
  migration8,
  migration9,
  migration10,
  migration11,
  migration12
]
