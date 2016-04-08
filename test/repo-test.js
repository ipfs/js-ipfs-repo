/* eslint-env mocha */

'use strict'

const expect = require('chai').expect
const base58 = require('bs58')
const bl = require('bl')
const fs = require('fs')

const isNode = !global.window

const fileA = isNode
  ? fs.readFileSync(process.cwd() + '/test/test-repo/blocks/12207028/122070286b9afa6620a66f715c7020d68af3d10e1a497971629c07606bfdb812303d.data')
  : require('buffer!./test-repo/blocks/12207028/122070286b9afa6620a66f715c7020d68af3d10e1a497971629c07606bfdb812303d.data')

module.exports = function (repo) {
  describe('IPFS Repo Tests', function () {
    it('check if Repo exists', (done) => {
      repo.exists((err, exists) => {
        expect(err).to.not.exist
        expect(exists).to.equal(true)
        done()
      })
    })

    describe('locks', () => {
      it('lock, unlock', (done) => {
        repo.locks.lock((err) => {
          expect(err).to.not.exist
          repo.locks.unlock((err) => {
            expect(err).to.not.exist
            done()
          })
        })
      })

      it('lock, lock', (done) => {
        repo.locks.lock((err) => {
          expect(err).to.not.exist
          repo.locks.lock((err) => {
            expect(err).to.not.exist
            repo.locks.unlock((err) => {
              expect(err).to.not.exist
              done()
            })
          })

          setTimeout(() => {
            repo.locks.unlock((err) => {
              expect(err).to.not.exist
            })
          }, 500)
        })
      })
    })

    describe('keys', () => {
      it('get PrivKey', (done) => {
        repo.keys.get((err, privKey) => {
          expect(err).to.not.exist
          expect(privKey).to.be.a('string')
          done()
        })
      })
    })

    describe('config', () => {
      it('get config', (done) => {
        repo.config.get((err, config) => {
          expect(err).to.not.exist
          expect(config).to.be.a('object')
          done()
        })
      })

      it('set config', (done) => {
        repo.config.set({a: 'b'}, (err) => {
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
      it('get version', (done) => {
        repo.version.get((err, version) => {
          expect(err).to.not.exist
          expect(version).to.be.a('string')
          expect(Number(version)).to.be.a('number')
          done()
        })
      })

      it('set version', (done) => {
        repo.version.set('9000', (err) => {
          expect(err).to.not.exist
          repo.version.get((err, version) => {
            expect(err).to.not.exist
            expect(version).to.equal('9000')
            done()
          })
        })
      })
    })

    describe('datastore', function () {
      const baseFileHash = 'QmVtU7ths96fMgZ8YSZAbKghyieq7AjxNdcqyVzxTt3qVe'

      it('reads block', function (done) {
        const buf = new Buffer(base58.decode(baseFileHash))
        repo.datastore.createReadStream(buf)
          .pipe(bl((err, data) => {
            expect(err).to.not.exist
            expect(data.equals(fileA)).to.equal(true)
            done()
          }))
      })

      it('write a block', function (done) {
        const rnd = 'QmVtU7ths96fMgZ8YSZAbKghyieq7AjxNdcqyVtesthash'
        const mh = new Buffer(base58.decode(rnd))
        const data = new Buffer('Oh the data')

        repo.datastore.createWriteStream(mh, (err, metadata) => {
          expect(err).to.not.exist
          expect(metadata.key).to.equal('12207028/122070286b9afa6620a66f715c7020d68af3d10e1a497971629c07605f55537ce990.data')
          done()
        }).end(data)
      })

      it('block exists', function (done) {
        const buf = new Buffer(base58.decode(baseFileHash))

        repo.datastore.exists(buf, (err, exists) => {
          expect(err).to.not.exist
          expect(exists).to.equal(true)
          done()
        })
      })

      it('check for non existent block', function (done) {
        const buf = new Buffer('random buffer')

        repo.datastore.exists(buf, (err, exists) => {
          expect(err).to.not.exist
          expect(exists).to.equal(false)
          done()
        })
      })

      it('remove a block', function (done) {
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
}
