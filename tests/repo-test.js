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

  it('init another Repo', function (done) {
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

  describe('api', function () {})
  describe('config', function () {
    it('get config', function (done) {
      repo.config.read(function (err, config) {
        expect(err).to.equal(null)
        expect(config).to.be.a('object')
        done()
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
      done()
    })
  })
  describe('blocks', function () {})

  describe('locks', function () {
    it('lock, unlock', function (done) {
      done()
    })
    it('lock on operation', function (done) {
      done()
    })
  })
})
