/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/chai'
import tempDir from 'ipfs-utils/src/temp-dir.js'
import { createRepo } from '../src/index.js'
import { loadCodec } from './fixtures/load-codec.js'
import { createBackend } from './fixtures/create-backend.js'
import { MemoryLock } from '../src/locks/memory.js'

export default () => {
  describe('isInitialized', () => {
    /** @type {import('../src/types').IPFSRepo} */
    let repo

    beforeEach(() => {
      repo = createRepo(tempDir(b => 'test-repo-for-' + b), loadCodec, createBackend(), {
        repoLock: MemoryLock
      })
    })

    it('should be false before initialization', async () => {
      expect(await repo.isInitialized()).to.be.false()
    })

    it('should be true after initialization', async () => {
      await repo.init({})
      expect(await repo.isInitialized()).to.be.true()
    })

    it('should be true after initialization and opening', async () => {
      await repo.init({})
      await repo.open()
      expect(await repo.isInitialized()).to.be.true()
    })

    it('should be true after initialization, opening and closing', async () => {
      await repo.init({})
      await repo.open()
      await repo.close()
      expect(await repo.isInitialized()).to.be.true()
    })
  })
}
