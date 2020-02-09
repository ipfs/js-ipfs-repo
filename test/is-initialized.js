/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const os = require('os')
const path = require('path')
const IPFSRepo = require('../src')

describe('isInitialized', () => {
  let repo

  beforeEach(() => {
    const repoPath = path.join(os.tmpdir(), 'test-repo-for-' + Math.random())
    repo = new IPFSRepo(repoPath)
  })

  it('should be false before initialization', async () => {
    expect(await repo.isInitialized()).to.be.false()
  })

  it('should be true after initialization', async () => {
    await repo.init({})
    expect(await repo.isInitialized()).to.be.true()
  })
})
