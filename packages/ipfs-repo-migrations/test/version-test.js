/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { VERSION_KEY, CONFIG_KEY } from '../src/utils.js'
import * as version from '../src/repo/version.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as errors from '../src/errors.js'

// When new versioning mechanism is introduced in new version don't forget to update
// the range (from/to) of the previous version test's description

/**
 * @param {import('./types').SetupFunction} setup
 * @param {import('./types').CleanupFunction} cleanup
 */
export function test (setup, cleanup) {
  /** @type {string} */
  let dir
  /** @type {import('../src/types').Backends} */
  let backends

  beforeEach(async () => {
    ({ dir, backends } = await setup())
  })

  afterEach(() => cleanup(dir))

  it('getVersion should fail without any version in repo', async () => {
    await expect(version.getVersion(backends)).to.be.eventually.rejectedWith(errors.NotInitializedRepoError)
      .with.property('code', errors.NotInitializedRepoError.code)
  })

  describe('version 7 and below', () => {
    it('should get version number', async () => {
      // Create version file
      const store = backends.root
      await store.open()
      await store.put(CONFIG_KEY, uint8ArrayFromString('some dummy config'))
      await store.put(VERSION_KEY, uint8ArrayFromString('7'))
      await store.close()

      expect(await version.getVersion(backends)).to.be.equal(7)
    })

    it('should set version number', async () => {
      await expect(version.getVersion(backends)).to.be.eventually.rejectedWith(errors.NotInitializedRepoError).with.property('code', errors.NotInitializedRepoError.code)

      // Create version file
      const store = backends.root
      await store.open()
      await store.put(CONFIG_KEY, uint8ArrayFromString('some dummy config'))
      await store.put(VERSION_KEY, uint8ArrayFromString('5'))
      await store.close()

      await version.setVersion(7, backends)
      expect(await version.getVersion(backends)).to.be.equal(7)
    })
  })
}
