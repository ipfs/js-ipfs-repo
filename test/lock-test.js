/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const { createRepo } = require('../')
const lockMemory = require('../src/locks/memory')
const { LockExistsError } = require('./../src/errors')
const loadCodec = require('./fixtures/load-codec')

/**
 * @param {import('../src/types').IPFSRepo} repo
 */
module.exports = (repo) => {
  describe('Repo lock tests', () => {
    it('should handle locking for a repo lifecycle', async () => {
      expect(repo.lockfile).to.not.equal(null)
      await repo.close()
      await repo.open()
    })

    it('should prevent multiple repos from using the same path', async () => {
      const repoClone = createRepo(repo.path, loadCodec, {
        blocks: repo.pins.blockstore,
        datastore: repo.datastore,
        root: repo.root,
        keys: repo.keys,
        pins: repo.pins.pinstore
      }, repo.options)
      try {
        await repoClone.init({})
        await repoClone.open()
      } catch (err) {
        expect(err.code)
          .to.equal(LockExistsError.code)
      }
    })
  })

  describe('lock-memory', () => {
    it('should lock and unlock dir', async () => {
      const dir = '/foo/bar'
      expect(await lockMemory.locked(dir)).to.be.false()

      const closer = await lockMemory.lock(dir)
      expect(await lockMemory.locked(dir)).to.be.true()

      await closer.close()
      expect(await lockMemory.locked(dir)).to.be.false()
    })

    it('should unlock a dir twice without exploding', async () => {
      const dir = '/foo/bar'
      const closer = await lockMemory.lock(dir)
      expect(await lockMemory.locked(dir)).to.be.true()

      await closer.close()
      expect(await lockMemory.locked(dir)).to.be.false()

      await closer.close()
      expect(await lockMemory.locked(dir)).to.be.false()
    })
  })
}
