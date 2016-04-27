/* eslint-env mocha */

'use strict'

const Repo = require('../src/index')
const expect = require('chai').expect
const Block = require('ipfs-block')

module.exports = function (repo) {
  describe('IPFS Repo Tests', function () {
    it('can init repo /wo new', (done) => {
      var repo
      function run () {
        repo = Repo('foo', { stores: require('abstract-blob-store') })
      }
      expect(run).to.not.throw(Error)
      expect(repo).to.be.an.instanceof(Repo)
      done()
    })

    it('bad repo init 1', (done) => {
      function run () {
        return new Repo()
      }
      expect(run).to.throw(Error)
      done()
    })

    it('bad repo init 2', (done) => {
      function run () {
        return new Repo('', {})
      }
      expect(run).to.throw(Error)
      done()
    })

    it('check if Repo exists', (done) => {
      repo.exists((err, exists) => {
        expect(err).to.not.exist
        expect(exists).to.equal(true)
        done()
      })
    })

    it('exposes the path', () => {
      expect(typeof repo.path).to.be.equal('string')
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
      const helloKey = '1220b94d/1220b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9.data'
      const helloIpldKey = '1220ed12/1220ed12932f3ef94c0792fbc55263968006e867e522cf9faa88274340a2671d4441.ipld'

      describe('.put', () => {
        it('simple', function (done) {
          const b = new Block('hello world')
          repo.datastore.put(b, (err, meta) => {
            expect(err).to.not.exist
            expect(meta.key).to.be.eql(helloKey)
            done()
          })
        })

        it('multi write (locks)', (done) => {
          const b = new Block('hello world')

          let i = 0
          const finish = () => {
            i++
            if (i === 2) done()
          }

          repo.datastore.put(b, (err, meta) => {
            expect(err).to.not.exist
            expect(meta.key).to.equal(helloKey)
            finish()
          })

          repo.datastore.put(b, (err, meta) => {
            expect(err).to.not.exist
            expect(meta.key).to.equal(helloKey)
            finish()
          })
        })

        it('custom extension', function (done) {
          const b = new Block('hello world 2', 'ipld')
          repo.datastore.put(b, (err, meta) => {
            expect(err).to.not.exist
            expect(meta.key).to.be.eql(helloIpldKey)
            done()
          })
        })

        it('returns an error on invalid block', (done) => {
          repo.datastore.put('hello', (err) => {
            expect(err.message).to.be.eql('Invalid block')
            done()
          })
        })
      })

      describe('.get', () => {
        it('simple', (done) => {
          const b = new Block('hello world')

          repo.datastore.get(b.key, (err, data) => {
            expect(err).to.not.exist
            expect(data).to.be.eql(b)

            done()
          })
        })

        it('custom extension', (done) => {
          const b = new Block('hello world 2', 'ipld')

          repo.datastore.get(b.key, b.extension, (err, data) => {
            expect(err).to.not.exist
            expect(data).to.be.eql(b)

            done()
          })
        })

        it('returns an error on invalid block', (done) => {
          repo.datastore.get(null, (err) => {
            expect(err.message).to.be.eql('Invalid key')
            done()
          })
        })
      })

      describe('.has', () => {
        it('existing block', (done) => {
          const b = new Block('hello world')

          repo.datastore.has(b.key, (err, exists) => {
            expect(err).to.not.exist
            expect(exists).to.equal(true)
            done()
          })
        })

        it('with extension', (done) => {
          const b = new Block('hello world')

          repo.datastore.has(b.key, 'data', (err, exists) => {
            expect(err).to.not.exist
            expect(exists).to.equal(true)
            done()
          })
        })

        it('non existent block', (done) => {
          const b = new Block('wooot')

          repo.datastore.has(b.key, (err, exists) => {
            expect(err).to.not.exist
            expect(exists).to.equal(false)
            done()
          })
        })
      })

      describe('.delete', () => {
        it('simple', (done) => {
          const b = new Block('hello world')

          repo.datastore.delete(b.key, (err) => {
            expect(err).to.not.exist

            repo.datastore.has(b.key, (err, exists) => {
              expect(err).to.not.exist
              expect(exists).to.equal(false)
              done()
            })
          })
        })

        it('custom extension', (done) => {
          const b = new Block('hello world', 'ipld')

          repo.datastore.delete(b.key, b.extension, (err) => {
            expect(err).to.not.exist

            repo.datastore.has(b.key, b.extension, (err, exists) => {
              expect(err).to.not.exist
              expect(exists).to.equal(false)
              done()
            })
          })
        })
      })
    })

    describe('datastore-legacy', () => {})
  })
}
