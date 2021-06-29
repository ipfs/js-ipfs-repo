/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')
const tempDir = require('ipfs-utils/src/temp-dir')
const { createRepo } = require('../')
const Errors = require('../src/errors')
const bytes = require('bytes')
const { Adapter, MemoryDatastore } = require('interface-datastore')
const { MemoryBlockstore } = require('interface-blockstore')
const loadCodec = require('./fixtures/load-codec')
const MemoryLock = require('../src/locks/memory')
const createBackend = require('./fixtures/create-backend')

/**
 * @param {import('../src/types').IPFSRepo} repo
 */
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
        const config = await repo.config.getAll()
        expect(config).to.be.a('object')
      })

      it('set config', async () => {
        await repo.config.replace({})
        await repo.config.set('a', 'b')
        const config = await repo.config.getAll()
        expect(config).to.deep.equal({ a: 'b' })
      })

      it('get config key', async () => {
        const value = await repo.config.get('a')
        expect(value).to.equal('b')
      })

      it('set config key', async () => {
        await repo.config.set('c.x', 'd')
        const config = await repo.config.getAll()
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
        await repo.version.set(10)
      })

      it('get version', async () => {
        const version = await repo.version.get()
        expect(version).to.equal(10)
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
        const memoryDs = new MemoryDatastore()
        const memoryBs = new MemoryBlockstore()
        const spyDs = sinon.spy(memoryDs, 'close')
        const spyBs = sinon.spy(memoryBs, 'close')

        const repo = createRepo(tempDir(), loadCodec, {
          root: memoryDs,
          blocks: memoryBs,
          keys: memoryDs,
          datastore: memoryDs,
          pins: memoryDs
        }, {
          repoLock: MemoryLock
        })
        await repo.init({})
        await repo.open()
        await repo.close()

        expect(spyDs.callCount + spyBs.callCount).to.equal(5)
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
        const otherRepo = createRepo(tempDir(), loadCodec, createBackend(), {
          repoLock: MemoryLock
        })
        const err = new Error('wat')

        otherRepo.root.open = () => {
          throw err
        }

        return expect(otherRepo.init({})).to.eventually.be.rejectedWith(err)
      })

      it('should ignore non-already-open errors when opening the root', async () => {
        const otherRepo = createRepo(tempDir(), loadCodec, createBackend(), {
          repoLock: MemoryLock
        })

        const err = new Error('Already open')
        let threwError = false

        otherRepo.root.open = () => {
          threwError = true
          throw err
        }

        // @ts-ignore we should not be using private stuff
        await otherRepo._openRoot()

        expect(threwError).to.be.true()
      })
    })

    describe('locking', () => {
      class ExplodingDatastore extends Adapter {
        async open () {
          throw new Error('wat')
        }
      }

      /** @type {IPFSRepo} */
      let otherRepo

      afterEach(async () => {
        try {
          await otherRepo.close()
        } catch (_) {
          // ignore error
        }
      })

      it('should remove the lockfile when opening the repo fails', async () => {
        otherRepo = createRepo(tempDir(), loadCodec, createBackend({
          datastore: new ExplodingDatastore()
        }), {
          repoLock: MemoryLock
        })

        await otherRepo.init({})
        await expect(otherRepo.open()).to.eventually.be.rejectedWith('wat')

        // @ts-expect-error - _lockfile not part of the interface
        expect(otherRepo._lockfile).to.be.null()
      })

      it('should re-throw the original error even when removing the lockfile fails', async () => {
        otherRepo = createRepo(tempDir(), loadCodec, createBackend({
          datastore: new ExplodingDatastore()
        }), {
          repoLock: MemoryLock
        })

        // @ts-ignore we should not be using private stuff
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
        otherRepo = createRepo(tempDir(), loadCodec, createBackend(), {
          repoLock: MemoryLock
        })

        try {
          await otherRepo.open()
        } catch (err) {
          expect(err.code).to.equal(Errors.ERR_REPO_NOT_INITIALIZED)
        }
      })

      it('should throw when config is not set', async () => {
        otherRepo = createRepo(tempDir(), loadCodec, createBackend(), {
          repoLock: MemoryLock
        })
        otherRepo.config.exists = async () => false
        otherRepo.spec.exists = async () => true
        otherRepo.version.check = async () => false

        try {
          await otherRepo.open()
        } catch (err) {
          expect(err.code).to.equal(Errors.ERR_REPO_NOT_INITIALIZED)
        }
      })

      it('should return the max storage stat when set', async () => {
        const maxStorage = '1GB'

        otherRepo = createRepo(tempDir(), loadCodec, createBackend(), {
          repoLock: MemoryLock
        })
        await otherRepo.init({})
        await otherRepo.open()
        await otherRepo.config.set('Datastore.StorageMax', maxStorage)

        const stat = await otherRepo.stat()

        expect(stat).to.have.property('storageMax')
        expect(stat.storageMax).to.equal(BigInt(bytes(maxStorage)))
      })

      it('should throw unexpected errors when closing', async () => {
        otherRepo = createRepo(tempDir(), loadCodec, createBackend(), {
          repoLock: MemoryLock
        })
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
        otherRepo = createRepo(tempDir(), loadCodec, createBackend(), {
          repoLock: MemoryLock
        })
        await otherRepo.init({})
        await otherRepo.open()

        const err = new Error('ENOENT')

        otherRepo.apiAddr.delete = () => {
          throw err
        }

        await otherRepo.close()
      })

      it('should throw unexpected errors when checking if the repo has been initialised', async () => {
        otherRepo = createRepo(tempDir(), loadCodec, createBackend(), {
          repoLock: MemoryLock
        })

        otherRepo.config.exists = async () => {
          return true
        }

        otherRepo.version.check = async () => {
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
