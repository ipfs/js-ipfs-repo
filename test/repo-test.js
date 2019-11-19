/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const IPFSRepo = require('../')
const Errors = require('../src/errors')
const os = require('os')
const bytes = require('bytes')

module.exports = (repo) => {
  describe('IPFS Repo Tests', () => {
    it('check if Repo exists', async () => {
      const exists = await repo.exists()
      expect(exists).to.equal(true)
    })

    it('exposes the path', () => {
      expect(repo.path).to.be.a('string')
    })

    describe('config', () => {
      it('get config', async () => {
        const config = await repo.config.get()
        expect(config).to.be.a('object')
      })

      it('set config', async () => {
        await repo.config.set({ a: 'b' })
        const config = await repo.config.get()
        expect(config).to.deep.equal({ a: 'b' })
      })

      it('get config key', async () => {
        const value = await repo.config.get('a')
        expect(value).to.equal('b')
      })

      it('set config key', async () => {
        await repo.config.set('c.x', 'd')
        const config = await repo.config.get()
        expect(config).to.deep.equal({ a: 'b', c: { x: 'd' } })
      })
    })

    describe('spec', () => {
      it('get spec', async () => {
        await repo.spec.get()
      })

      it('set spec', async () => {
        await repo.spec.set({ a: 'b' })
        const spec = await repo.spec.get()
        expect(spec).to.deep.equal({ a: 'b' })
      })
    })

    describe('version', () => {
      afterEach(async () => {
        await repo.version.set(7)
      })

      it('get version', async () => {
        const version = await repo.version.get()
        expect(version).to.equal(7)
      })

      it('set version', async () => {
        const v1 = 9000
        await repo.version.set(v1)
        expect(await repo.version.get()).to.equal(v1)
      })

      it('returns true when requested version is the same as the actual version', async () => {
        await repo.version.set(5)
        expect(await repo.version.check(5)).to.be.true()
      })

      it('returns false when requesting a past version', async () => {
        await repo.version.set(5)
        expect(await repo.version.check(4)).to.be.false()
      })

      it('returns false when requesting a future version', async () => {
        await repo.version.set(1)
        expect(await repo.version.check(2)).to.be.false()
      })

      it('treats v6 and v7 as the same', async () => {
        await repo.version.set(7)
        expect(await repo.version.check(6)).to.be.true()
      })

      it('treats v7 and v6 as the same', async () => {
        await repo.version.set(6)
        expect(await repo.version.check(7)).to.be.true()
      })
    })

    describe('lifecycle', () => {
      it('close and open', async () => {
        await repo.close()
        await repo.open()
        await repo.close()
        await repo.open()
        const version = await repo.version.get()
        expect(version).to.exist()
      })

      it('close twice throws error', async () => {
        await repo.close()
        try {
          await repo.close()
        } catch (err) {
          expect(err.code).to.eql(Errors.ERR_REPO_ALREADY_CLOSED)
          return
        }
        expect.fail('Did not throw')
      })

      it('should close all the datastores', async () => {
        let count = 0
        class FakeDatastore {
          constructor () {
            this.data = {}
          }
          async open () {}
          // eslint-disable-next-line require-await
          async put (key, val) {
            this.data[key.toString()] = val
          }
          async get (key) {
            const exists = await this.has(key)
            if (!exists) throw Errors.notFoundError()
            return this.data[key.toString()]
          }
          // eslint-disable-next-line require-await
          async has (key) {
            return this.data[key.toString()] !== undefined
          }
          // eslint-disable-next-line require-await
          async delete (key) {
            delete this.data[key.toString()]
          }
          batch () {}
          query (q) {}
          // eslint-disable-next-line require-await
          async close () {
            count++
          }
        }
        const repo = new IPFSRepo(path.join(os.tmpdir(), 'repo-' + Date.now()), {
          lock: 'memory',
          storageBackends: {
            root: FakeDatastore,
            blocks: FakeDatastore,
            keys: FakeDatastore,
            datastore: FakeDatastore
          }
        })
        await repo.init({})
        await repo.open()
        await repo.close()
        expect(count).to.be.eq(4)
      })

      it('open twice throws error', async () => {
        await repo.open()
        try {
          await repo.open()
        } catch (err) {
          expect(err.code).to.eql(Errors.ERR_REPO_ALREADY_OPEN)
          return
        }
        expect.fail('Did not throw')
      })

      it('should throw non-already-open errors when opening the root', async () => {
        const otherRepo = new IPFSRepo(path.join(os.tmpdir(), 'repo-' + Date.now()))
        const err = new Error('wat')

        otherRepo.root.open = () => {
          throw err
        }

        try {
          await otherRepo.init({})
        } catch (err2) {
          expect(err2).to.deep.equal(err)
        }
      })

      it('should ingore non-already-open errors when opening the root', async () => {
        const otherRepo = new IPFSRepo(path.join(os.tmpdir(), 'repo-' + Date.now()))

        const err = new Error('Already open')
        let threwError = false

        otherRepo.root.open = () => {
          threwError = true
          throw err
        }

        await otherRepo.init({})

        expect(threwError).to.be.true()
      })
    })

    describe('locking', () => {
      class ExplodingDatastore {
        constructor () {
          throw new Error('wat')
        }
      }

      let otherRepo

      afterEach(async () => {
        try {
          await otherRepo.close()
        } catch (_) {
          // ignore error
        }
      })

      it('should remove the lockfile when opening the repo fails', async () => {
        otherRepo = new IPFSRepo(path.join(os.tmpdir(), 'repo-' + Date.now()), {
          storageBackends: {
            datastore: ExplodingDatastore
          }
        })

        try {
          await otherRepo.init({})
          await otherRepo.open()
        } catch (err) {
          expect(otherRepo.lockfile).to.be.null()
        }
      })

      it('should re-throw the original error even when removing the lockfile fails', async () => {
        otherRepo = new IPFSRepo(path.join(os.tmpdir(), 'repo-' + Date.now()), {
          storageBackends: {
            datastore: ExplodingDatastore
          }
        })

        otherRepo._closeLock = () => {
          throw new Error('derp')
        }

        try {
          await otherRepo.init({})
          await otherRepo.open()
        } catch (err) {
          expect(err.message).to.equal('wat')
        }
      })

      it('should throw when repos are not initialised', async () => {
        otherRepo = new IPFSRepo(path.join(os.tmpdir(), 'repo-' + Date.now()), {
          storageBackends: {
            datastore: ExplodingDatastore
          }
        })

        try {
          await otherRepo.open()
        } catch (err) {
          expect(err.code).to.equal(Errors.ERR_REPO_NOT_INITIALIZED)
        }
      })

      it('should throw when config is not set', async () => {
        otherRepo = new IPFSRepo(path.join(os.tmpdir(), 'repo-' + Date.now()))
        otherRepo.config.exists = () => {
          return false
        }
        otherRepo.spec.exists = () => {
          return true
        }
        otherRepo.version.check = () => {
          return null
        }

        try {
          await otherRepo.open()
        } catch (err) {
          expect(err.code).to.equal(Errors.ERR_REPO_NOT_INITIALIZED)
        }
      })

      it('should return the max storage stat when set', async () => {
        const maxStorage = '1GB'

        otherRepo = new IPFSRepo(path.join(os.tmpdir(), 'repo-' + Date.now()))
        await otherRepo.init({})
        await otherRepo.open()
        await otherRepo.config.set('Datastore.StorageMax', maxStorage)

        const stat = await otherRepo.stat({})

        expect(stat).to.have.property('storageMax')
        expect(stat.storageMax.toNumber()).to.equal(bytes(maxStorage))
      })

      it('should throw unexpected errors when closing', async () => {
        otherRepo = new IPFSRepo(path.join(os.tmpdir(), 'repo-' + Date.now()))
        await otherRepo.init({})
        await otherRepo.open()

        const err = new Error('wat')

        otherRepo.apiAddr.delete = () => {
          throw err
        }

        try {
          await otherRepo.close()
          throw new Error('Should have thrown')
        } catch (err2) {
          expect(err2).to.equal(err)
        }
      })

      it('should swallow expected errors when closing', async () => {
        otherRepo = new IPFSRepo(path.join(os.tmpdir(), 'repo-' + Date.now()))
        await otherRepo.init({})
        await otherRepo.open()

        const err = new Error('ENOENT')

        otherRepo.apiAddr.delete = () => {
          throw err
        }

        await otherRepo.close()
      })

      it('should throw unexpected errors when checking if the repo has been initialised', async () => {
        otherRepo = new IPFSRepo(path.join(os.tmpdir(), 'repo-' + Date.now()))

        otherRepo.config.exists = () => {
          return true
        }

        otherRepo.version.check = () => {
          return true
        }

        const err = new Error('ENOENT')

        otherRepo.spec.exists = () => {
          throw err
        }

        try {
          await otherRepo.open()
          throw new Error('Should have thrown')
        } catch (err2) {
          expect(err2).to.equal(err)
        }
      })
    })
  })
}
