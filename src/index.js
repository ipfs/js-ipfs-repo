'use strict'

const _get = require('just-safe-get')
const debug = require('debug')
const errcode = require('err-code')
const migrator = require('ipfs-repo-migrations')
const bytes = require('bytes')
const pathJoin = require('ipfs-utils/src/path-join')
const merge = require('merge-options')
const constants = require('./constants')
const backends = require('./backends')
const version = require('./version')
const config = require('./config')
const spec = require('./spec')
const apiAddr = require('./api-addr')
const blockstore = require('./blockstore')
const idstore = require('./idstore')
const defaultOptions = require('./default-options')
const defaultDatastore = require('./default-datastore')
const ERRORS = require('./errors')

const log = debug('ipfs:repo')

const noLimit = Number.MAX_SAFE_INTEGER
const AUTO_MIGRATE_CONFIG_KEY = 'repoAutoMigrate'

/** @type {Record<string, Lock>} */
const lockers = {
  memory: require('./lock-memory'),
  fs: require('./lock')
}

/**
 * @typedef {import('./types').Options} Options
 * @typedef {import('./types').Lock} Lock
 * @typedef {import('./types').LockCloser} LockCloser
 * @typedef {import('./types').Stat} Stat
 * @typedef {import('./types').Blockstore} Blockstore
 * @typedef {import('./types').Config} Config
 * @typedef {import('ipld-block')} Block
 * @typedef {import('interface-datastore').Datastore} Datastore
 */

/**
 * IpfsRepo implements all required functionality to read and write to an ipfs repo.
 */
class IpfsRepo {
  /**
   * @param {string} repoPath - path where the repo is stored
   * @param {Options} [options] - Configuration
   */
  constructor (repoPath, options = {}) {
    if (typeof repoPath !== 'string') {
      throw new Error('missing repoPath')
    }

    this.options = merge(defaultOptions, options)
    this.closed = true
    this.path = repoPath

    /**
     * @private
     */
    this._locker = this._getLocker()
    this.root = backends.create('root', this.path, this.options)
    this.datastore = backends.create('datastore', pathJoin(this.path, 'datastore'), this.options)
    this.keys = backends.create('keys', pathJoin(this.path, 'keys'), this.options)
    this.pins = backends.create('pins', pathJoin(this.path, 'pins'), this.options)
    const blocksBaseStore = backends.create('blocks', pathJoin(this.path, 'blocks'), this.options)
    const blockStore = blockstore(blocksBaseStore, this.options.storageBackendOptions.blocks)
    this.blocks = idstore(blockStore)
    this.version = version(this.root)
    this.config = config(this.root)
    this.spec = spec(this.root)
    this.apiAddr = apiAddr(this.root)
  }

  /**
   * Initialize a new repo.
   *
   * @param {import('./types').Config} config - config to write into `config`.
   * @returns {Promise<void>}
   */
  async init (config) {
    log('initializing at: %s', this.path)
    await this._openRoot()
    await this.config.replace(buildConfig(config))
    await this.spec.set(buildDatastoreSpec(config))
    await this.version.set(constants.repoVersion)
  }

  /**
   * Check if the repo is already initialized.
   *
   * @returns {Promise<boolean>}
   */
  async isInitialized () {
    if (!this.closed) {
      // repo is open, must be initialized
      return true
    }

    try {
      // have to open the root datastore in the browser before
      // we can check whether it's been initialized
      await this._openRoot()
      await this._checkInitialized()
      await this.root.close()

      return true
    } catch (err) {
      // FIXME: do not use exceptions for flow control
      return false
    }
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

      const isCompatible = await this.version.check(constants.repoVersion)

      if (!isCompatible) {
        if (await this._isAutoMigrationEnabled()) {
          await this._migrate(constants.repoVersion)
        } else {
          throw new ERRORS.InvalidRepoVersionError('Incompatible repo versions. Automatic migrations disabled. Please migrate the repo manually.')
        }
      }

      log('creating datastore')
      await this.datastore.open()

      log('creating blocks')
      this.blocks.open()

      log('creating keystore')
      await this.keys.open()

      log('creating pins')
      await this.pins.open()

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
   * Returns the repo locker to be used.
   *
   * @private
   */
  _getLocker () {
    if (typeof this.options.lock === 'string') {
      if (!lockers[this.options.lock]) {
        throw new Error('Unknown lock type: ' + this.options.lock)
      }
      return lockers[this.options.lock]
    }

    if (!this.options.lock) {
      throw new Error('No lock provided')
    }
    return this.options.lock
  }

  /**
   * Opens the root backend, catching and ignoring an 'Already open' error
   *
   * @private
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
   * @private
   * @param {string} path
   * @returns {Promise<LockCloser>}
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
   * @private
   */
  _closeLock () {
    return this.lockfile && this.lockfile.close()
  }

  /**
   * Check if the repo is already initialized.
   *
   * @private
   */
  async _checkInitialized () {
    log('init check')
    let config
    try {
      [config] = await Promise.all([
        this.config.exists(),
        this.spec.exists(),
        this.version.exists()
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

    await Promise.all([
      this.root,
      this.blocks,
      this.keys,
      this.datastore,
      this.pins
    ].map((store) => store && store.close()))

    log('unlocking')
    this.closed = true
    await this._closeLock()
  }

  /**
   * Check if a repo exists.
   *
   * @returns {Promise<boolean>}
   */
  exists () {
    return this.version.exists()
  }

  /**
   * Get repo status.
   *
   * @returns {Promise<Stat>}
   */
  async stat () {
    if (this.datastore && this.keys) {
      const [storageMax, blocks, version, datastore, keys] = await Promise.all([
        this._storageMaxStat(),
        this._blockStat(),
        this.version.get(),
        getSize(this.datastore),
        getSize(this.keys)
      ])
      const size = blocks.size + datastore + keys

      return {
        repoPath: this.path,
        storageMax,
        version: version,
        numObjects: blocks.count,
        repoSize: size
      }
    }
    throw errcode(new Error('repo is not initialized yet'), ERRORS.ERR_REPO_NOT_INITIALIZED, {
      path: this.path
    })
  }

  /**
   * @private
   */
  async _isAutoMigrationEnabled () {
    if (this.options.autoMigrate !== undefined) {
      return this.options.autoMigrate
    }

    // TODO we need to figure out the priority here, between repo options and config.
    let autoMigrateConfig
    try {
      autoMigrateConfig = await this.config.get(AUTO_MIGRATE_CONFIG_KEY)
    } catch (e) {
      if (e.code === ERRORS.NotFoundError.code) {
        autoMigrateConfig = true // Config's default value is True
      } else {
        throw e
      }
    }

    return autoMigrateConfig
  }

  /**
   * Internal migration
   *
   * @private
   * @param {number} toVersion
   */
  async _migrate (toVersion) {
    const currentRepoVersion = await this.version.get()

    if (currentRepoVersion > toVersion) {
      log(`reverting to version ${toVersion}`)
      return migrator.revert(this.path, this.options, toVersion, {
        ignoreLock: true,
        onProgress: this.options.onMigrationProgress
      })
    } else {
      log(`migrating to version ${toVersion}`)
      return migrator.migrate(this.path, this.options, toVersion, {
        ignoreLock: true,
        onProgress: this.options.onMigrationProgress
      })
    }
  }

  /**
   * @private
   */
  async _storageMaxStat () {
    try {
      const max = /** @type {number} */(await this.config.get('Datastore.StorageMax'))
      return BigInt(bytes(max))
    } catch (err) {
      return BigInt(noLimit)
    }
  }

  /**
   * @private
   */
  async _blockStat () {
    let count = BigInt(0)
    let size = BigInt(0)

    if (this.blocks) {
      for await (const blockOrCid of this.blocks.query({})) {
        const block = /** @type {Block} */(blockOrCid)
        count += BigInt(1)
        size += BigInt(block.data.byteLength)
        size += BigInt(block.cid.bytes.byteLength)
      }
    }

    return { count, size }
  }
}

/**
 * @param {Datastore} datastore
 */
async function getSize (datastore) {
  let sum = BigInt(0)
  for await (const block of datastore.query({})) {
    sum += BigInt(block.value.byteLength)
    sum += BigInt(block.key.uint8Array().byteLength)
  }
  return sum
}

module.exports = IpfsRepo
module.exports.utils = { blockstore: require('./blockstore-utils') }
module.exports.repoVersion = constants.repoVersion
module.exports.errors = ERRORS

/**
 * @param {import('./types').Config} _config
 */
function buildConfig (_config) {
  _config.Datastore = Object.assign({}, defaultDatastore, _get(_config, 'datastore'))

  return _config
}

/**
 * @param {import('./types').Config} _config
 */
function buildDatastoreSpec (_config) {
  /** @type { {type: string, mounts: Array<{mountpoint: string, type: string, prefix: string, child: {type: string, path: 'string', sync: boolean, shardFunc: string}}>}} */
  const spec = {
    ...defaultDatastore.Spec,
    ..._get(_config, 'Datastore.Spec')
  }

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
