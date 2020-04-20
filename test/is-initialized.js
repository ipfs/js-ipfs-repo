/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const tempDir = require('ipfs-utils/src/temp-dir')
chai.use(require('dirty-chai'))
const expect = chai.expect
const IPFSRepo = require('../src')

describe('isInitialized', () => {
  let repo

  beforeEach(() => {
    repo = new IPFSRepo(tempDir(b => 'test-repo-for-' + b))
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
