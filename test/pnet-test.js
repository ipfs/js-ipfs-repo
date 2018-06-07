/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const series = require('async/series')

const Repo = require('../')
const Errors = require('../').errors

describe('private network', () => {
  describe('swarm key', () => {
    const repoPath = path.join(__dirname, 'slash', 'path')
    const swarmRepoPath = path.join(__dirname, 'fixtures/pnet-repo')

    afterEach(() => {
      rimraf.sync(repoPath)
    })

    it('returns an error if no swarm key is found', (done) => {
      const repo = new Repo(repoPath)

      repo.swarmKey((err, swarmKeyBuffer) => {
        expect(swarmKeyBuffer).to.not.exist()
        expect(err).to.include({
          message: Errors.SWARM_KEY_NOT_FOUND
        })
        done()
      })
    })

    it('gets the swarm.key', (done) => {
      const repo = new Repo(repoPath)

      series([
        (cb) => {
          // copy the swarm key to the repo root
          ncp(swarmRepoPath, repoPath, cb)
        },
        (cb) => {
          repo.swarmKey((err, swarmKeyBuffer) => {
            expect(err).to.not.exist()
            expect(Buffer.isBuffer(swarmKeyBuffer)).to.equal(true)
            expect(swarmKeyBuffer.byteLength).to.equal(95)
            cb()
          })
        }
      ], done)
    })
  })
})
