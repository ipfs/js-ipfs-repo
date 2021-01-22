/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const tempDir = require('ipfs-utils/src/temp-dir')
const { isNode } = require('ipfs-utils/src/env')
const rimraf = require('rimraf')
if (!rimraf.sync) {
  // browser
  rimraf.sync = noop
}
const Repo = require('../')

describe('custom options tests', () => {
  const repoPath = tempDir()
  after(() => {
    rimraf.sync(repoPath)
  })

  it('missing repoPath', () => {
    expect(
      // @ts-expect-error
      () => new Repo()
    ).to.throw('missing repoPath')
  })

  it('default options', () => {
    const repo = new Repo(repoPath)
    expect(repo.options).to.deep.equal(expectedRepoOptions())
  })

  it('allows for a custom lock', () => {
    const lock = {
      /**
       * @param {any} path
       */
      lock: async (path) => {
        return Promise.resolve({
          close () { return Promise.resolve() }
        })
      },
      /**
       * @param {any} path
       */
      locked: async (path) => {
        return Promise.resolve(true)
      }
    }

    const repo = new Repo(repoPath, {
      lock
    })

    // @ts-ignore we should not be using private methods
    expect(repo._getLocker()).to.deep.equal(lock)
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

    const repo = new Repo(repoPath, {
      // @ts-expect-error
      lock
    })
    let error
    try {
      // @ts-ignore we should not be using private methods
      await repo._openLock(repo.path)
    } catch (err) {
      error = err
    }
    expect(error.code).to.equal('ERR_NO_CLOSE_FUNCTION')
  })
})

function noop () {}

function expectedRepoOptions () {
  if (isNode) {
    return require('../src/default-options')
  }
  return require('../src/default-options-browser')
}
