'use strict'

const _get = require('just-safe-get')
const assert = require('assert')
const path = require('path')
const debug = require('debug')
const Big = require('bignumber.js')
const errcode = require('err-code')

const backends = require('./backends')
const version = require('./version')
const config = require('./config')
const spec = require('./spec')
const apiAddr = require('./api-addr')
const blockstore = require('./blockstore')
const defaultOptions = require('./default-options')
const defaultDatastore = require('./default-datastore')
const ERRORS = require('./errors')

const log = debug('repo')

const noLimit = Number.MAX_SAFE_INTEGER

const lockers = {
  memory: require('./lock-memory'),
  fs: require('./lock')
}

const repoVersion = require('./constants').repoVersion

/**
 * IpfsRepo implements all required functionality to read and write to an ipfs repo.
 *
 */
class IpfsRepo {
  /**
   * @param {string} repoPath - path where the repo is stored
   * @param {object} options - Configuration
   */
  constructor (repoPath, options) {
    assert.strictEqual(typeof repoPath, 'string', 'missing repoPath')

    this.options = buildOptions(options)
    this.closed = true
    this.path = repoPath

    this._locker = this._getLocker()

    this.root = backends.create('root', this.path, this.options)
    this.version = version(this.root)
    this.config = config(this.root)
    this.spec = spec(this.root)
    this.apiAddr = apiAddr(this.root)
  }

  /**
   * Initialize a new repo.
   *
   * @param {Object} config - config to write into `config`.
   * @returns {Promise<void>}
   */
  async init (config) {
    log('initializing at: %s', this.path)
    await this._openRoot()
    await this.config.set(buildConfig(config))
    await this.spec.set(buildDatastoreSpec(config))
    await this.version.set(repoVersion)
  }

  /**
   * Open the repo. If the repo is already open an error will be thrown.
   * If the repo is not initialized it will throw an error.
   *
   * @returns {Promise<void>}
   */
  async open () {
    if (!this.closed) {
      throw errcode(new Error('repo is already open'), ERRORS.ERR_REPO_ALREADY_OPEN)
    }
    log('opening at: %s', this.path)

    // check if the repo is already initialized
    try {
      await this._openRoot()
      await this._checkInitialized()
      this.lockfile = await this._openLock(this.path)
      log('acquired repo.lock')
      log('creating datastore')
      this.datastore = backends.create('datastore', path.join(this.path, 'datastore'), this.options)
      log('creating blocks')
      const blocksBaseStore = backends.create('blocks', path.join(this.path, 'blocks'), this.options)
      this.blocks = await blockstore(blocksBaseStore, this.options.storageBackendOptions.blocks)
      log('creating keystore')
      this.keys = backends.create('keys', path.join(this.path, 'keys'), this.options)
      this.closed = false
      log('all opened')
    } catch (err) {
      if (this.lockfile) {
        try {
          await this._closeLock()
          this.lockfile = null
        } catch (err2) {
          log('error removing lock', err2)
        }
      }

      throw err
    }
  }

  /**
   * Returns the repo locker to be used. Null will be returned if no locker is requested
   *
   * @private
   * @returns {Locker}
   */
  _getLocker () {
    if (typeof this.options.lock === 'string') {
      assert(lockers[this.options.lock], 'Unknown lock type: ' + this.options.lock)
      return lockers[this.options.lock]
    }

    assert(this.options.lock, 'No lock provided')
    return this.options.lock
  }

  /**
   * Opens the root backend, catching and ignoring an 'Already open' error
   * @returns {Promise}
   */
  async _openRoot () {
    try {
      await this.root.open()
    } catch (err) {
      if (err.message !== 'Already open') {
        throw err
      }
    }
  }

  /**
   * Creates a lock on the repo if a locker is specified. The lockfile object will
   * be returned in the callback if one has been created.
   *
   * @param {string} path
   * @returns {Promise<lockfile>}
   */
  async _openLock (path) {
    const lockfile = await this._locker.lock(path)

    if (typeof lockfile.close !== 'function') {
      throw errcode(new Error('Locks must have a close method'), 'ERR_NO_CLOSE_FUNCTION')
    }

    return lockfile
  }

  /**
   * Closes the lock on the repo
   *
   * @returns {Promise<void>}
   */
  _closeLock () {
    return this.lockfile.close()
  }

  /**
   * Check if the repo is already initialized.
   * @private
   * @returns {Promise}
   */
  async _checkInitialized () {
    log('init check')
    let config
    try {
      [config] = await Promise.all([
        this.config.exists(),
        this.spec.exists(),
        this.version.check(repoVersion)
      ])
    } catch (err) {
      if (err.code === 'ERR_NOT_FOUND') {
        throw errcode(new Error('repo is not initialized yet'), ERRORS.ERR_REPO_NOT_INITIALIZED, {
          path: this.path
        })
      }

      throw err
    }

    if (!config) {
      throw errcode(new Error('repo is not initialized yet'), ERRORS.ERR_REPO_NOT_INITIALIZED, {
        path: this.path
      })
    }
  }

  /**
   * Close the repo and cleanup.
   *
   * @returns {Promise<void>}
   */
  async close () {
    if (this.closed) {
      throw errcode(new Error('repo is already closed'), ERRORS.ERR_REPO_ALREADY_CLOSED)
    }
    log('closing at: %s', this.path)

    try {
      // Delete api, ignoring irrelevant errors
      await this.apiAddr.delete()
    } catch (err) {
      if (err.code !== ERRORS.ERR_REPO_NOT_INITIALIZED && !err.message.startsWith('ENOENT')) {
        throw err
      }
    }

    await Promise.all([this.blocks, this.keys, this.datastore].map((store) => store.close()))
    log('unlocking')
    this.closed = true
    await this._closeLock()
    this.lockfile = null
  }

  /**
   * Check if a repo exists.
   *
   * @returns {Promise<bool>}
   */
  async exists () { // eslint-disable-line require-await
    return this.version.exists()
  }

  /**
   * Get repo status.
   *
   * @param {Object}  options
   * @param {Boolean} options.human
   * @return {Object}
   */
  async stat (options) {
    options = Object.assign({}, { human: false }, options)
    let storageMax, blocks, version, datastore, keys
    [storageMax, blocks, version, datastore, keys] = await Promise.all([
      this._storageMaxStat(),
      this._blockStat(),
      this.version.get(),
      getSize(this.datastore),
      getSize(this.keys)
    ])
    let size = blocks.size
      .plus(datastore)
      .plus(keys)

    if (options.human) {
      size = size.div(1048576)
    }
    return {
      repoPath: this.path,
      storageMax: storageMax,
      version: version,
      numObjects: blocks.count,
      repoSize: size
    }
  }

  async _storageMaxStat () {
    try {
      const max = await this.config.get('Datastore.StorageMax')
      return new Big(max)
    } catch (err) {
      return new Big(noLimit)
    }
  }

  async _blockStat () {
    let count = new Big(0)
    let size = new Big(0)

    for await (const block of this.blocks.query({})) {
      count = count.plus(1)
      size = size
        .plus(block.value.byteLength)
        .plus(block.key._buf.byteLength)
    }

    return { count, size }
  }
}

async function getSize (queryFn) {
  let sum = new Big(0)
  for await (const block of queryFn.query({})) {
    sum.plus(block.value.byteLength)
      .plus(block.key._buf.byteLength)
  }
  return sum
}

module.exports = IpfsRepo
module.exports.utils = { blockstore: require('./blockstore-utils') }
module.exports.repoVersion = repoVersion
module.exports.errors = ERRORS

function buildOptions (_options) {
  const options = Object.assign({}, defaultOptions, _options)

  options.storageBackends = Object.assign(
    {},
    defaultOptions.storageBackends,
    options.storageBackends)

  options.storageBackendOptions = Object.assign(
    {},
    defaultOptions.storageBackendOptions,
    options.storageBackendOptions)

  return options
}

// TODO this should come from js-ipfs instead
function buildConfig (_config) {
  _config.datastore = Object.assign({}, defaultDatastore, _get(_config, 'datastore', {}))

  return _config
}

function buildDatastoreSpec (_config) {
  const spec = Object.assign({}, defaultDatastore.Spec, _get(_config, 'datastore.Spec', {}))

  return {
    type: spec.type,
    mounts: spec.mounts.map((mounting) => ({
      mountpoint: mounting.mountpoint,
      type: mounting.child.type,
      path: mounting.child.path,
      shardFunc: mounting.child.shardFunc
    }))
  }
}
