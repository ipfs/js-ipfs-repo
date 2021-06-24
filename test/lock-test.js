/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const IPFSRepo = require('../')
const lockMemory = require('../src/lock-memory')
const { LockExistsError } = require('./../src/errors')
const loadCodec = require('./fixtures/load-codec')

/**
 * @param {import('../src/index')} repo
 */
module.exports = (repo) => {
  describe('Repo lock tests', () => {
    it('should handle locking for a repo lifecycle', async () => {
      expect(repo.lockfile).to.not.equal(null)
      await repo.close()
      await repo.open()
    })

    it('should prevent multiple repos from using the same path', async () => {
      const repoClone = new IPFSRepo(repo.path, loadCodec, repo.options)
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
