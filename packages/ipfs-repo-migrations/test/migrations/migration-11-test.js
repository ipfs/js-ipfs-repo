/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */

import { expect } from 'aegir/utils/chai.js'
import { CID } from 'multiformats/cid'
import { migration } from '../../migrations/migration-11/index.js'
import { Key } from 'interface-datastore/key'

const MFS_ROOT_KEY = new Key('/local/filesroot')
const MFS_ROOT = CID.parse('Qmc42sn2WBHYeAShU3nx8mYkhKVq4sRLapawTaGh4XH4iE')

/**
 * @param {import('../types').SetupFunction} setup
 * @param {import('../types').CleanupFunction} cleanup
 */
export function test (setup, cleanup) {
  describe('migration 11', function () {
    this.timeout(1024 * 1000)
    /** @type {string} */
    let dir
    /** @type {import('../../src/types').Backends} */
    let backends

    beforeEach(async () => {
      ({ dir, backends } = await setup())
    })

    afterEach(async () => {
      await cleanup(dir)
    })

    describe('forwards', () => {
      beforeEach(async () => {
        await backends.root.open()
        await backends.root.put(MFS_ROOT_KEY, MFS_ROOT.bytes)
        await backends.root.close()
      })

      it('should migrate MFS root forward', async () => {
        await migration.migrate(backends, () => {})

        await backends.root.open()
        await backends.datastore.open()

        await expect(backends.root.has(MFS_ROOT_KEY)).to.eventually.be.false()
        await expect(backends.datastore.has(MFS_ROOT_KEY)).to.eventually.be.true()

        await backends.datastore.close()
        await backends.root.close()
      })
    })

    describe('backwards', () => {
      beforeEach(async () => {
        await backends.datastore.open()
        await backends.datastore.put(MFS_ROOT_KEY, MFS_ROOT.bytes)
        await backends.datastore.close()
      })

      it('should migrate MFS root backward', async () => {
        await migration.revert(backends, () => {})

        await backends.root.open()
        await backends.datastore.open()

        await expect(backends.root.has(MFS_ROOT_KEY)).to.eventually.be.true()
        await expect(backends.datastore.has(MFS_ROOT_KEY)).to.eventually.be.false()

        await backends.datastore.close()
        await backends.root.close()
      })
    })
  })
}
