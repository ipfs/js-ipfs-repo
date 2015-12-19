/* globals describe, before, after, it*/

var expect = require('chai').expect
var ncp = require('ncp').ncp
var rimraf = require('rimraf')
var base58 = require('bs58')
var bl = require('bl')
var fs = require('fs')

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

  describe('keys', function () {
    it('get PrivKey', function (done) {
      repo.keys.get(function (err, privKey) {
        expect(err).to.equal(null)
        expect(privKey).to.be.a('string')
        done()
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

  describe('datastore', function () {
    var baseFileHash = 'QmVtU7ths96fMgZ8YSZAbKghyieq7AjxNdcqyVzxTt3qVe'

    it('reads block', function (done) {
      var buf = new Buffer(base58.decode(baseFileHash))
      repo.datastore.createReadStream(buf)
        .pipe(bl(function (err, data) {
          expect(err).to.equal(null)
          var eq = fs.readFileSync(process.cwd() + '/tests/test-repo/blocks/12207028/122070286b9afa6620a66f715c7020d68af3d10e1a497971629c07606bfdb812303d.data').equals(data)
          expect(eq).to.equal(true)
          done()
        }))
    })

    it('reads block and parses into protobuf', function (done) {
      done()
    })

    it('writes protobuf into valid block', function (done) {
      done()
    })
  })

  describe('datastore-legacy', function () {})
})
