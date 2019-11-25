/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const rimraf = require('rimraf')
if (!rimraf.sync) {
  // browser
  rimraf.sync = noop
}
const Repo = require('../')

describe('custom options tests', () => {
  const repoPath = path.join(__dirname, 'slash', 'path')
  after(() => {
    rimraf.sync(repoPath)
  })

  it('missing repoPath', () => {
    expect(
      () => new Repo()
    ).to.throw('missing repoPath')
  })

  it('default options', () => {
    const repo = new Repo(repoPath)
    expect(repo.options).to.deep.equal(expectedRepoOptions())
  })

  it('allows for a custom lock', () => {
    const lock = {
      lock: async (path) => { },
      locked: async (path) => { }
    }

    const repo = new Repo(repoPath, {
      lock
    })

    expect(repo._getLocker()).to.deep.equal(lock)
  })

  it('ensures a custom lock has a .close method', async () => {
    const lock = {
      lock: () => {
        return {}
      }
    }

    const repo = new Repo(repoPath, {
      lock
    })
    let error
    try {
      await repo._openLock(repo.path)
    } catch (err) {
      error = err
    }
    expect(error.code).to.equal('ERR_NO_CLOSE_FUNCTION')
  })
})

function noop () {}

function expectedRepoOptions () {
  if (process.browser) {
    return require('../src/default-options-browser')
  }

  return require('../src/default-options')
}
