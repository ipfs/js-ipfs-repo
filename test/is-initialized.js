/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const tempDir = require('ipfs-utils/src/temp-dir')
const { createRepo } = require('../src')
const loadCodec = require('./fixtures/load-codec')
const createBackend = require('./fixtures/create-backend')
const MemoryLock = require('../src/locks/memory')

/**
 * @typedef {import('../src/types').IPFSRepo} IPFSRepo
 */

describe('isInitialized', () => {
  /** @type {IPFSRepo} */
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
