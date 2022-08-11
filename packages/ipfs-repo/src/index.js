import _get from 'just-safe-get'
import debug from 'debug'
import errCode from 'err-code'
import * as migrator from 'ipfs-repo-migrations'
import bytes from 'bytes'
import merge from 'merge-options'
import * as CONSTANTS from './constants.js'
import { version } from './version.js'
import { config } from './config.js'
import { spec } from './spec.js'
import { apiAddr } from './api-addr.js'
import { createIdStore } from './idstore.js'
import defaultOptions from './default-options.js'
import defaultDatastore from './default-datastore.js'
import * as ERRORS from './errors.js'
import { PinManager } from './pin-manager.js'
import { createPinnedBlockstore } from './pinned-blockstore.js'
// @ts-ignore - no types
import mortice from 'mortice'
import { gc } from './gc.js'

const log = debug('ipfs:repo')

const noLimit = Number.MAX_SAFE_INTEGER
const AUTO_MIGRATE_CONFIG_KEY = 'repoAutoMigrate'

/**
 * @typedef {import('./types').Options} Options
 * @typedef {import('./types').RepoLock} RepoLock
 * @typedef {import('./types').LockCloser} LockCloser
 * @typedef {import('./types').GCLock} GCLock
 * @typedef {import('./types').Stat} Stat
 * @typedef {import('./types').Config} Config
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 * @typedef {import('./types').Backends} Backends
 * @typedef {import('./types').IPFSRepo} IPFSRepo
 */

/**
 * IPFSRepo implements all required functionality to read and write to an ipfs repo.
 */
class Repo {
  /**
   * @param {string} path - Where this repo is stored
   * @param {import('./types').loadCodec} loadCodec - a function that will load multiformat block codecs
   * @param {Backends} backends - backends used by this repo
   * @param {Partial<Options>} [options] - Configuration
   */
  constructor (path, loadCodec, backends, options) {
    if (typeof path !== 'string') {
      throw new Error('missing repo path')
    }

    if (typeof loadCodec !== 'function') {
      throw new Error('missing codec loader')
    }

    /** @type {Options} */
    this.options = merge(defaultOptions, options)
    this.closed = true
    this.path = path
    this.root = backends.root
    this.datastore = backends.datastore
    this.keys = backends.keys

    const blockstore = backends.blocks
    const pinstore = backends.pins

    this.pins = new PinManager({ pinstore, blockstore, loadCodec })

    // this blockstore will not delete blocks that have been pinned
    const pinnedBlockstore = createPinnedBlockstore(this.pins, blockstore)

    // this blockstore will extract blocks from multihashes with the identity codec
    this.blocks = createIdStore(pinnedBlockstore)

    this.version = version(this.root)
    this.config = config(this.root)
    this.spec = spec(this.root)
    this.apiAddr = apiAddr(this.root)

    /** @type {GCLock} */
    this.gcLock = mortice({
      name: path,
      singleProcess: this.options.repoOwner !== false
    })

    this.gc = gc({ gcLock: this.gcLock, pins: this.pins, blockstore: this.blocks, root: this.root, loadCodec })
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
    await this.version.set(CONSTANTS.repoVersion)
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
    } catch (/** @type {any} */ err) {
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
      throw errCode(new Error('repo is already open'), ERRORS.ERR_REPO_ALREADY_OPEN)
    }
    log('opening at: %s', this.path)

    // check if the repo is already initialized
    try {
      await this._openRoot()
      await this._checkInitialized()

      this._lockfile = await this._openLock()
      log('acquired repo.lock')

      const isCompatible = await this.version.check(CONSTANTS.repoVersion)

      if (!isCompatible) {
        if (await this._isAutoMigrationEnabled()) {
          await this._migrate(CONSTANTS.repoVersion, {
            root: this.root,
            datastore: this.datastore,
            pins: this.pins.pinstore,
            blocks: this.pins.blockstore,
            keys: this.keys
          })
        } else {
          throw new ERRORS.InvalidRepoVersionError('Incompatible repo versions. Automatic migrations disabled. Please migrate the repo manually.')
        }
      }

      log('creating datastore')
      await this.datastore.open()

      log('creating blocks')
      await this.blocks.open()

      log('creating keystore')
      await this.keys.open()

      log('creating pins')
      await this.pins.pinstore.open()

      this.closed = false
      log('all opened')
    } catch (/** @type {any} */ err) {
      if (this._lockfile) {
        try {
          await this._closeLock()
          this._lockfile = null
        } catch (/** @type {any} */ err2) {
          log('error removing lock', err2)
        }
      }

      throw err
    }
  }

  /**
   * Opens the root backend, catching and ignoring an 'Already open' error
   *
   * @private
   */
  async _openRoot () {
    try {
      await this.root.open()
    } catch (/** @type {any} */ err) {
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
   * @returns {Promise<LockCloser>}
   */
  async _openLock () {
    const lockfile = await this.options.repoLock.lock(this.path)

    if (typeof lockfile.close !== 'function') {
      throw errCode(new Error('Locks must have a close method'), 'ERR_NO_CLOSE_FUNCTION')
    }

    return lockfile
  }

  /**
   * Closes the lock on the repo
   *
   * @private
   */
  _closeLock () {
    return this._lockfile && this._lockfile.close()
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
    } catch (/** @type {any} */ err) {
      if (err.code === 'ERR_NOT_FOUND') {
        throw errCode(new Error('repo is not initialized yet'), ERRORS.ERR_REPO_NOT_INITIALIZED, {
          path: this.path
        })
      }

      throw err
    }

    if (!config) {
      throw errCode(new Error('repo is not initialized yet'), ERRORS.ERR_REPO_NOT_INITIALIZED, {
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
      throw errCode(new Error('repo is already closed'), ERRORS.ERR_REPO_ALREADY_CLOSED)
    }
    log('closing at: %s', this.path)

    try {
      // Delete api, ignoring irrelevant errors
      await this.apiAddr.delete()
    } catch (/** @type {any} */ err) {
      if (err.code !== ERRORS.ERR_REPO_NOT_INITIALIZED && !err.message.startsWith('ENOENT')) {
        throw err
      }
    }

    await Promise.all([
      this.root,
      this.blocks,
      this.keys,
      this.datastore,
      this.pins.pinstore
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
    throw errCode(new Error('repo is not initialized yet'), ERRORS.ERR_REPO_NOT_INITIALIZED, {
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
    } catch (/** @type {any} */ e) {
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
   * @param {Backends} backends
   */
  async _migrate (toVersion, backends) {
    const currentRepoVersion = await this.version.get()

    if (currentRepoVersion > toVersion) {
      log(`reverting to version ${toVersion}`)
      return migrator.revert(this.path, backends, this.options, toVersion, {
        ignoreLock: true,
        onProgress: this.options.onMigrationProgress
      })
    } else {
      log(`migrating to version ${toVersion}`)
      return migrator.migrate(this.path, backends, this.options, toVersion, {
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
    } catch (/** @type {any} */ err) {
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
      for await (const { key, value } of this.blocks.query({})) {
        count += BigInt(1)
        size += BigInt(value.byteLength)
        size += BigInt(key.bytes.byteLength)
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

/**
 * @param {string} path - Where this repo is stored
 * @param {import('./types').loadCodec} loadCodec - a function that will load multiformat block codecs
 * @param {import('./types').Backends} backends - backends used by this repo
 * @param {Partial<Options>} [options] - Configuration
 * @returns {import('./types').IPFSRepo}
 */
export function createRepo (path, loadCodec, backends, options) {
  return new Repo(path, loadCodec, backends, options)
}

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
