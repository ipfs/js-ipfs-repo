/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const series = require('async/series')
const IPFSRepo = require('../')

module.exports = (repo) => {
  describe('Repo lock tests', () => {
    it('should handle locking for a repo lifecycle', (done) => {
      expect(repo.lockfile).to.not.equal(null)
      series([
        (cb) => {
          repo.close(cb)
        },
        (cb) => {
          expect(repo.lockfile).to.equal(null)
          cb()
        },
        (cb) => {
          repo.open(cb)
        }
      ], done)
    })

    it('should prevent multiple repos from using the same path', (done) => {
      const repoClone = new IPFSRepo(repo.path, repo.options)

      // Levelup throws an uncaughtException when a lock already exists, catch it
      const mochaExceptionHandler = process.listeners('uncaughtException').pop()
      process.removeListener('uncaughtException', mochaExceptionHandler)
      process.once('uncaughtException', function (err) {
        expect(err.message).to.match(/already held|IO error/)
      })

      series([
        (cb) => {
          try {
            repoClone.init({}, cb)
          } catch (err) {
            cb(err)
          }
        },
        (cb) => {
          repoClone.open(cb)
        }
      ], function (err) {
        // There will be no listeners if the uncaughtException was triggered
        if (process.listeners('uncaughtException').length > 0) {
          expect(err.message).to.match(/already locked|already held|ENOENT/)
        }

        // Reset listeners to maintain test integrity
        process.removeAllListeners('uncaughtException')
        process.addListener('uncaughtException', mochaExceptionHandler)

        done()
      })
    })
  })
}
