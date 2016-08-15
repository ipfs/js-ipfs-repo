'use strict'

const assert = require('assert')

const stores = require('./stores')

module.exports = class Repo {
  constructor (repoPath, options) {
    assert.equal(typeof repoPath, 'string', 'missing repoPath')
    assert(options, 'missing options')
    assert(options.stores, 'missing options.stores')

    this.path = repoPath

    const blobStores = initializeBlobStores(options.stores)

    const setup = (name, needs) => {
      needs = needs || {}
      const args = [repoPath, blobStores[name]]
      if (needs.locks) {
        args.push(this.locks)
      }

      if (needs.config) {
        args.push(this.config)
      }

      return stores[name].setUp.apply(stores[name], args)
    }

    this.locks = setup('locks')
    this.version = setup('version', {locks: true})
    this.config = setup('config', {locks: true})
    this.keys = setup('keys', {locks: true, config: true})
    this.blockstore = setup('blockstore', {locks: true})
  }

  exists (callback) {
    this.version.exists(callback)
  }
}

function initializeBlobStores (store) {
  if (store.constructor) {
    return {
      keys: store,
      config: store,
      blockstore: store,
      logs: store,
      locks: store,
      version: store
    }
  }

  return store
}
