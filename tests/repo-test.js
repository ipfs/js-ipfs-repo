/* globals describe, before, after, it*/

// var assert = require('assert')
var expect = require('chai').expect
var ncp = require('ncp').ncp
var rimraf = require('rimraf')

var IPFSRepo = require('./../src')

describe('IPFS Repo Tests', function () {
  var repo
  var testRepoPath = __dirname + '/test-repo'
  var date = Date.now().toString()
  var repoPath = testRepoPath + date

  before(function (done) {
    ncp(testRepoPath, repoPath, function (err) {
      if (err) {
        expect(err).to.equal(null)
      }
      done()
    })
  })

  after(function (done) {
    rimraf(repoPath, function (err) {
      if (err) {
        expect(err).to.equal(null)
      }
      done()
    })
  })

  it('check if Repo exists', function (done) {
    repo = new IPFSRepo(repoPath)
    repo.exists(function (err, exists) {
      expect(err).to.equal(null)
      expect(exists).to.equal(true)
      done()
    })
  })

  it.skip('init another Repo', function (done) {
    var tmpRepoPath = __dirname + '/tmp-repo'
    var tmpRepo = new IPFSRepo(tmpRepoPath)
    tmpRepo.init({ ID: 'ID' }, function (err) {
      expect(err).to.equal(undefined)
      rimraf(tmpRepoPath, function (err) {
        if (err) {
          expect(err).to.equal(null)
        }
        done()
      })
    })
  })

  describe('locks', function () {
    it('lock, unlock', function (done) {
      repo.locks.lock(function (err) {
        expect(err).to.equal(undefined)
        repo.locks.unlock(function (err) {
          expect(err).to.equal(undefined)
          done()
        })
      })
    })

    it('lock, lock', function (done) {
      repo.locks.lock(function (err) {
        expect(err).to.equal(undefined)
        repo.locks.lock(function (err) {
          expect(err).to.equal(undefined)
          repo.locks.unlock(function (err) {
            expect(err).to.equal(undefined)
            done()
          })
        })

        setTimeout(function () {
          repo.locks.unlock(function (err) {
            expect(err).to.equal(undefined)
          })
        }, 500)
      })
    })
  })

  describe('config', function () {
    it('get config', function (done) {
      repo.config.get(function (err, config) {
        expect(err).to.equal(null)
        expect(config).to.be.a('object')
        done()
      })
    })

    it('set config', function (done) {
      repo.config.set({a: 'b'}, function (err) {
        expect(err).to.equal(undefined)
        repo.config.get(function (err, config) {
          expect(err).to.equal(null)
          expect(config).to.deep.equal({a: 'b'})
          done()
        })
      })
    })
  })

  describe('version', function () {
    it('get version', function (done) {
      repo.version.get(function (err, version) {
        expect(err).to.equal(null)
        expect(version).to.be.a('string')
        expect(Number(version)).to.be.a('number')
        done()
      })
    })

    it('set version', function (done) {
      repo.version.set('9000', function (err) {
        expect(err).to.equal(undefined)
        repo.version.get(function (err, version) {
          expect(err).to.equal(null)
          expect(version).to.equal('9000')
          done()
        })
      })
    })
  })
  describe('blocks', function () {})
})
