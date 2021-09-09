'use strict'

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

module.exports = [
  Object.assign({ version: 1 }, emptyMigration),
  Object.assign({ version: 2 }, emptyMigration),
  Object.assign({ version: 3 }, emptyMigration),
  Object.assign({ version: 4 }, emptyMigration),
  Object.assign({ version: 5 }, emptyMigration),
  Object.assign({ version: 6 }, emptyMigration),
  Object.assign({ version: 7 }, emptyMigration),
  require('./migration-8'),
  require('./migration-9'),
  require('./migration-10'),
  require('./migration-11')
]
