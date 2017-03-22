/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const series = require('async/series')
const waterfall = require('async/waterfall')

const Repo = require('../src')

module.exports = (repo) => {
  describe('IPFS Repo Tests', () => {
    describe('new', () => {
      it('missing arguments', () => {
        expect(
          () => new Repo()
        ).to.throw(Error)
      })
    })

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
    })

    describe('version', () => {
      it('get version', (done) => {
        repo.version.get((err, version) => {
          expect(err).to.not.exist()
          expect(version).to.be.eql(5)
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
          (cb) => repo.version.set(5, cb)
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
            console.log(version)
            expect(version).to.exist()
            cb()
          }
        ], done)
      })
    })
  })
}
