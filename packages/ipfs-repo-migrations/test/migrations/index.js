import { test as migration8Test } from './migration-8-test.js'
import { test as migration9Test } from './migration-9-test.js'
import { test as migration10Test } from './migration-10-test.js'
import { test as migration11Test } from './migration-11-test.js'
import { test as migration12Test } from './migration-12-test.js'

/**
 * @param {import('../types').SetupFunction} setup
 * @param {import('../types').CleanupFunction} cleanup
 */
export function test (setup, cleanup) {
  migration8Test(setup, cleanup)
  migration9Test(setup, cleanup)
  migration10Test(setup, cleanup)
  migration11Test(setup, cleanup)
  migration12Test(setup, cleanup)
}
