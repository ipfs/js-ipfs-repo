/* globals describe, before, after, it*/

const expect = require('chai').expect
const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const base58 = require('bs58')
const bl = require('bl')
const fs = require('fs')

const IPFSRepo = require('./../src')

describe('IPFS Repo Tests', () => {
  var repo
  const testRepoPath = __dirname + '/test-repo'
  const date = Date.now().toString()
  const repoPath = testRepoPath + date

  before(done => {
    ncp(testRepoPath, repoPath, err => {
      expect(err).to.not.exist
      done()
    })
  })

  after(done => {
    rimraf(repoPath, err => {
      expect(err).to.not.exist
      done()
    })
  })

  it('check if Repo exists', done => {
    repo = new IPFSRepo(repoPath)
    repo.exists((err, exists) => {
      expect(err).to.not.exist
      expect(exists).to.equal(true)
      done()
    })
  })

  it.skip('init another Repo', done => {
    const tmpRepoPath = __dirname + '/tmp-repo'
    const tmpRepo = new IPFSRepo(tmpRepoPath)
    tmpRepo.init({ ID: 'ID' }, err => {
      expect(err).to.not.exist
      rimraf(tmpRepoPath, err => {
        expect(err).to.not.exist
        done()
      })
    })
  })

  describe('locks', () => {
    it('lock, unlock', done => {
      repo.locks.lock(err => {
        expect(err).to.not.exist
        repo.locks.unlock(err => {
          expect(err).to.not.exist
          done()
        })
      })
    })

    it('lock, lock', done => {
      repo.locks.lock(err => {
        expect(err).to.not.exist
        repo.locks.lock(err => {
          expect(err).to.not.exist
          repo.locks.unlock(err => {
            expect(err).to.not.exist
            done()
          })
        })

        setTimeout(() => {
          repo.locks.unlock(err => {
            expect(err).to.not.exist
          })
        }, 500)
      })
    })
  })

  describe('keys', () => {
    it('get PrivKey', done => {
      repo.keys.get((err, privKey) => {
        expect(err).to.not.exist
        expect(privKey).to.be.a('string')
        done()
      })
    })
  })

  describe('config', () => {
    it('get config', done => {
      repo.config.get((err, config) => {
        expect(err).to.not.exist
        expect(config).to.be.a('object')
        done()
      })
    })

    it('set config', done => {
      repo.config.set({a: 'b'}, err => {
        expect(err).to.not.exist
        repo.config.get((err, config) => {
          expect(err).to.not.exist
          expect(config).to.deep.equal({a: 'b'})
          done()
        })
      })
    })
  })

  describe('version', () => {
    it('get version', done => {
      repo.version.get((err, version) => {
        expect(err).to.not.exist
        expect(version).to.be.a('string')
        expect(Number(version)).to.be.a('number')
        done()
      })
    })

    it('set version', done => {
      repo.version.set('9000', err => {
        expect(err).to.not.exist
        repo.version.get((err, version) => {
          expect(err).to.not.exist
          expect(version).to.equal('9000')
          done()
        })
      })
    })
  })

  describe('datastore', () => {
    const baseFileHash = 'QmVtU7ths96fMgZ8YSZAbKghyieq7AjxNdcqyVzxTt3qVe'

    it('reads block', done => {
      const buf = new Buffer(base58.decode(baseFileHash))
      repo.datastore.createReadStream(buf)
        .pipe(bl((err, data) => {
          expect(err).to.not.exist
          const eq = fs.readFileSync(process.cwd() + '/tests/test-repo/blocks/12207028/122070286b9afa6620a66f715c7020d68af3d10e1a497971629c07606bfdb812303d.data').equals(data)
          expect(eq).to.equal(true)
          done()
        }))
    })

    it('write a block', done => {
      const rnd = 'QmVtU7ths96fMgZ8YSZAbKghyieq7AjxNdcqyVtesthash'
      const mh = new Buffer(base58.decode(rnd))
      const data = new Buffer('Oh the data')

      repo.datastore.createWriteStream(mh, (err, metadata) => {
        expect(err).to.not.exist
        expect(metadata.key).to.equal('12207028/122070286b9afa6620a66f715c7020d68af3d10e1a497971629c07605f55537ce990.data')
        done()
      }).end(data)
    })

    it('block exists', done => {
      const buf = new Buffer(base58.decode(baseFileHash))

      repo.datastore.exists(buf, (err, exists) => {
        expect(err).to.not.exist
        expect(exists).to.equal(true)
        done()
      })
    })

    it('check for non existent block', done => {
      const buf = new Buffer('random buffer')

      repo.datastore.exists(buf, (err, exists) => {
        expect(err).to.not.exist
        expect(exists).to.equal(false)
        done()
      })
    })

    it('remove a block', done => {
      const buf = new Buffer(base58.decode(baseFileHash))
      repo.datastore.remove(buf, (err) => {
        expect(err).to.not.exist
        repo.datastore.exists(buf, (err, exists) => {
          expect(err).to.not.exist
          expect(exists).to.equal(false)
          done()
        })
      })
    })
  })

  describe('datastore-legacy', () => {})
})
