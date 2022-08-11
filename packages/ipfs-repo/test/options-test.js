/* eslint-env mocha */

import { expect } from 'aegir/chai'
import sinon from 'sinon'
import tempDir from 'ipfs-utils/src/temp-dir.js'
import rimraf from 'rimraf'
import { createRepo } from '../src/index.js'
import { loadCodec } from './fixtures/load-codec.js'
import { createBackend } from './fixtures/create-backend.js'

if (!rimraf.sync) {
  // browser
  rimraf.sync = noop
}

export default () => {
  describe('custom options tests', () => {
    const repoPath = tempDir()
    after(() => {
      rimraf.sync(repoPath)
    })

    it('missing repoPath', () => {
      expect(
        // @ts-expect-error
        () => createRepo()
      ).to.throw('missing repo path')
    })

    it('allows for a custom lock', async () => {
      const release = {
        close () { return Promise.resolve() }
      }

      const lock = {
        /**
         * @param {string} path
         */
        lock: (path) => {
          return Promise.resolve(release)
        },
        /**
         * @param {string} path
         */
        locked: (path) => {
          return Promise.resolve(true)
        }
      }

      const lockSpy = sinon.spy(lock, 'lock')
      const releaseSpy = sinon.spy(release, 'close')

      const repo = createRepo(repoPath, loadCodec, createBackend(), {
        repoLock: lock
      })

      await repo.init({})
      await repo.open()
      await repo.close()

      expect(lockSpy.callCount).to.equal(1)
      expect(releaseSpy.callCount).to.equal(1)
    })

    it('ensures a custom lock has a .close method', async () => {
      const lock = {
        /**
         * @param {any} path
         */
        lock: async (path) => {
          return Promise.resolve({
            shouldBeCalledClose () { return Promise.resolve() }
          })
        },
        /**
         * @param {any} path
         */
        locked: async (path) => {
          return Promise.resolve(true)
        }
      }

      const repo = createRepo(repoPath, loadCodec, createBackend(), {
        // @ts-expect-error lock closer types are wrong
        repoLock: lock
      })
      let error
      try {
        // @ts-ignore we should not be using private methods
        await repo._openLock(repo.path)
      } catch (/** @type {any} */ err) {
        error = err
      }
      expect(error.code).to.equal('ERR_NO_CLOSE_FUNCTION')
    })
  })
}

function noop () {}
