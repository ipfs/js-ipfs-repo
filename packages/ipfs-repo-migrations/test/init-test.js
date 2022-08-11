/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { CONFIG_KEY, VERSION_KEY } from '../src/utils.js'
import { isRepoInitialized } from '../src/repo/init.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

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
  afterEach(() =>
    cleanup(dir)
  )

  it('should return true with valid initialized repo', async () => {
    const store = backends.root
    await store.open()
    await store.put(VERSION_KEY, uint8ArrayFromString('7'))
    await store.put(CONFIG_KEY, uint8ArrayFromString('config'))
    await store.close()

    expect(await isRepoInitialized(backends)).to.be.true()
  })

  it('should return false with missing version key', async () => {
    const store = backends.root
    await store.open()
    await store.put(CONFIG_KEY, uint8ArrayFromString(''))
    await store.close()

    expect(await isRepoInitialized(backends)).to.be.false()
  })

  it('should return false with missing config key', async () => {
    const store = backends.root
    await store.open()
    await store.put(VERSION_KEY, uint8ArrayFromString(''))
    await store.close()

    expect(await isRepoInitialized(backends)).to.be.false()
  })

  it('should return false if the repo does not exists', async () => {
    return expect(await isRepoInitialized(backends)).to.be.false()
  })
}
