/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const series = require('async/series')

const Repo = require('../src/index')

module.exports = (testConfig) => {
  describe('IPFS Repo Tests', () => {
    describe('init', () => {
      it('bad repo init 1', () => {
        expect(
          () => new Repo()
        ).to.throw(Error)
      })

      it('bad repo init 2', () => {
        expect(
          () => new Repo('', {})
        ).to.throw(Error)
      })
    })

    it('check if Repo exists', (done) => {
      testConfig.repo.exists((err, exists) => {
        expect(err).to.not.exist
        expect(exists).to.equal(true)
        done()
      })
    })

    it('exposes the path', () => {
      expect(testConfig.repo.path).to.be.a('string')
    })

    describe('locks', () => {
      it('lock, unlock', (done) => {
        series([
          (cb) => testConfig.repo.locks.lock(cb),
          (cb) => testConfig.repo.locks.unlock(cb)
        ], done)
      })

      it('lock, lock', (done) => {
        series([
          (cb) => testConfig.repo.locks.lock(cb),
          (cb) => testConfig.repo.locks.lock(cb),
          (cb) => testConfig.repo.locks.unlock(cb)
        ], done)

        setTimeout(() => {
          testConfig.repo.locks.unlock((err) => {
            expect(err).to.not.exist
          })
        }, 500)
      })
    })

    describe('keys', () => {
      it('get PrivKey', (done) => {
        testConfig.repo.keys.get((err, privKey) => {
          expect(err).to.not.exist
          expect(privKey).to.be.a('string')
          done()
        })
      })
    })

    describe('config', () => {
      it('get config', (done) => {
        testConfig.repo.config.get((err, config) => {
          expect(err).to.not.exist
          expect(config).to.be.a('object')
          done()
        })
      })

      it('set config', (done) => {
        series([
          (cb) => testConfig.repo.config.set({a: 'b'}, cb),
          (cb) => testConfig.repo.config.get((err, config) => {
            if (err) return cb(err)
            expect(config).to.deep.equal({a: 'b'})
            cb()
          })
        ], done)
      })
    })

    describe('version', () => {
      it('get version', (done) => {
        testConfig.repo.version.get((err, version) => {
          expect(err).to.not.exist
          expect(version).to.be.a('string')
          expect(Number(version)).to.be.a('number')
          done()
        })
      })

      it('set version', (done) => {
        testConfig.repo.version.set('9000', (err) => {
          expect(err).to.not.exist
          testConfig.repo.version.get((err, version) => {
            expect(err).to.not.exist
            expect(version).to.equal('9000')
            done()
          })
        })
      })
    })

    require('./blockstore-test')(testConfig)

    describe('datastore', () => {})
  })
}
