/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const series = require('async/series')
const waterfall = require('async/waterfall')

module.exports = (repo) => {
  describe('IPFS Repo Tests', () => {
    it('check if Repo exists', (done) => {
      repo.exists((err, exists) => {
        expect(err).to.not.exist()
        expect(exists).to.equal(true)
        done()
      })
    })

    it('exposes the path', () => {
      expect(repo.path).to.be.a('string')
    })

    describe('config', () => {
      it('get config', (done) => {
        repo.config.get((err, config) => {
          expect(err).to.not.exist()
          expect(config).to.be.a('object')
          done()
        })
      })

      it('set config', (done) => {
        series([
          (cb) => repo.config.set({a: 'b'}, cb),
          (cb) => repo.config.get((err, config) => {
            if (err) return cb(err)
            expect(config).to.deep.equal({a: 'b'})
            cb()
          })
        ], done)
      })

      it('get config key', (done) => {
        repo.config.get('a', (err, value) => {
          expect(err).to.not.exist()
          expect(value).to.equal('b')
          done()
        })
      })

      it('set config key', (done) => {
        series([
          (cb) => repo.config.set('c.x', 'd', cb),
          (cb) => repo.config.get((err, config) => {
            if (err) return cb(err)
            expect(config).to.deep.equal({a: 'b', c: { x: 'd' }})
            cb()
          })
        ], done)
      })
    })

    describe('version', () => {
      it('get version', (done) => {
        repo.version.get((err, version) => {
          expect(err).to.not.exist()
          expect(version).to.equal(6)
          done()
        })
      })

      it('set version', (done) => {
        waterfall([
          (cb) => repo.version.set(9000, cb),
          (cb) => repo.version.get(cb),
          (version, cb) => {
            expect(version).to.equal(9000)
            cb()
          },
          (cb) => repo.version.set(6, cb)
        ], done)
      })
    })

    describe('lifecycle', () => {
      it('close and open', (done) => {
        waterfall([
          (cb) => repo.close(cb),
          (cb) => repo.open(cb),
          (cb) => repo.close(cb),
          (cb) => repo.open(cb),
          (cb) => repo.version.get(cb),
          (version, cb) => {
            expect(version).to.exist()
            cb()
          }
        ], done)
      })
    })
  })
}
