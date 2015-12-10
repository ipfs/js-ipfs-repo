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
    expect(repo.exists()).to.equal(true)
    done()
  })

  it('load the Repo', function (done) {
    repo.load()
    done()
  })

  it('init another Repo', function (done) { done() })

  describe('api', function () {})
  describe('config', function () {})
  describe('version', function () {
    it('get version', function (done) {
      repo.version.read(function (err, version) {
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
})
