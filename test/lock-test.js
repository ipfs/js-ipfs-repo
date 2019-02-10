/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const IPFSRepo = require('../')

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
        expect(err.message).to.match(/already held|IO error|already being hold/)
      })

      try {
        await repoClone.init({})
        await repoClone.open()
      } catch (err) {
        if (process.listeners('uncaughtException').length > 0) {
          expect(err.message).to.match(/already locked|already held|already being hold|ELOCKED/)
        }
      } finally {
        // Reset listeners to maintain test integrity
        process.removeAllListeners('uncaughtException')
        process.addListener('uncaughtException', mochaExceptionHandler)
      }
    })
  })
}
