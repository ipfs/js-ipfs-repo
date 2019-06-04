/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const IPFSRepo = require('../')
const lockMemory = require('../src/lock-memory')

module.exports = (repo) => {
  describe('Repo lock tests', () => {
    it('should handle locking for a repo lifecycle', async () => {
      expect(repo.lockfile).to.not.equal(null)
      await repo.close()
      await repo.open()
    })

    it('should prevent multiple repos from using the same path', async () => {
      const repoClone = new IPFSRepo(repo.path, repo.options)

      // Levelup throws an uncaughtException when a lock already exists, catch it
      const mochaExceptionHandler = process.listeners('uncaughtException').pop()
      process.removeListener('uncaughtException', mochaExceptionHandler)
      process.once('uncaughtException', function (err) {
        expect(err.message).to.match(/already held|IO error|already being held/)
      })

      try {
        await repoClone.init({})
        await repoClone.open()
      } catch (err) {
        if (process.listeners('uncaughtException').length > 0) {
          expect(err.message).to.match(/already locked|already held|already being held|ELOCKED/)
        }
      } finally {
        // Reset listeners to maintain test integrity
        process.removeAllListeners('uncaughtException')
        process.addListener('uncaughtException', mochaExceptionHandler)
      }
    })
  })

  describe('lock-memory', () => {
    it('should lock a dir', async () => {
      const dir = '/foo/bar'
      expect(await lockMemory.locked(dir)).to.be.false()

      await lockMemory.lock(dir)
      expect(await lockMemory.locked(dir)).to.be.true()
    })

    it('should unlock a dir', async () => {
      const dir = '/foo/bar'
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
