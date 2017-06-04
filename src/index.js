'use strict'

const core = require('datastore-core')
const MountStore = core.MountDatastore
const ShardingStore = core.ShardingDatastore

const Key = require('interface-datastore').Key
const waterfall = require('async/waterfall')
const series = require('async/series')
const parallel = require('async/parallel')
const Multiaddr = require('multiaddr')
const Buffer = require('safe-buffer').Buffer
const assert = require('assert')
const path = require('path')
const debug = require('debug')

const version = require('./version')
const config = require('./config')
const blockstore = require('./blockstore')

const log = debug('repo')

const apiFile = new Key('api')
const blockStoreDirectory = 'blocks'
const dataStoreDirectory = 'datastore'
const repoVersion = 5

/**
 * IpfsRepo implements all required functionality to read and write to an ipfs repo.
 *
 */
class IpfsRepo {
  /**
   * @param {string} repoPath - path where the repo is stored
   * @param {object} options - Configuration
   * @param {datastore} options.blockStore
   * @param {datastore} options.dataStore
   * @param {object} [options.blockStoreOptions={}]
   * @param {object} [options.dataStoreOptions={}]
   * @param {bool} [options.sharding=true] - Enable sharding (flatfs on disk), not needed in the browser.
   * @param {string} [options.lock='fs'] - Either `fs` or `memory`.
   */
  constructor (repoPath, options) {
    assert.equal(typeof repoPath, 'string', 'missing repoPath')

    const defaultOptions = require('./default-options')
    this.closed = true
    this.path = repoPath
    this.options = Object.assign({ lock: 'memory', sharding: true }, options || defaultOptions)
    const BlockStore = this.options.blockStore
    this._blockStore = new BlockStore(this.path, this.options.blockStoreOptions)

    this.version = version(this._blockStore)
    this.config = config(this._blockStore)

    if (this.options.lock === 'memory') {
      this._locker = require('./lock-memory')
    } else if (this.options.lock === 'fs') {
      this._locker = require('./lock')
    } else {
      throw new Error('Unkown lock options: ' + this.options.lock)
    }
  }

  /**
   * Initialize a new repo.
   *
   * @param {Object} config - config to write into `config`.
   * @param {function(Error)} callback
   * @returns {void}
   */
  init (config, callback) {
    log('initializing at: %s', this.path)

    series([
      (cb) => this._blockStore.open((err) => {
        if (err && err.message === 'Already open') {
          return cb()
        }
        cb(err)
      }),
      (cb) => this.config.set(config, cb),
      (cb) => this.version.set(repoVersion, cb)
    ], callback)
  }

  /**
   * Open the repo. If the repo is already open no action will be taken.
   * If the repo is not initialized it will return an error.
   *
   * @param {function(Error)} callback
   * @returns {void}
   */
  open (callback) {
    if (!this.closed) {
      return callback(new Error('repo is already open'))
    }
    log('opening at: %s', this.path)

    // check if the repo is already initialized
    waterfall([
      (cb) => this._blockStore.open((err) => {
        if (err && err.message === 'Already open') {
          return cb()
        }
        cb(err)
      }),
      (cb) => this._isInitialized(cb),
      (cb) => this._locker.lock(this.path, cb),
      (lck, cb) => {
        log('aquired repo.lock')
        this.lockfile = lck

        log('creating flatfs')
        const BlockStore = this.options.blockStore
        const s = new BlockStore(path.join(this.path, blockStoreDirectory), this.options.blockStoreOptions)

        if (this.options.sharding) {
          const shard = new core.shard.NextToLast(2)
          ShardingStore.createOrOpen(s, shard, cb)
        } else {
          cb(null, s)
        }
      },
      (blockStore, cb) => {
        log('Flatfs store opened')
        const DataStore = this.options.dataStore
        const dataStore = new DataStore(path.join(this.path, dataStoreDirectory), this.options.dataStoreOptions)
        log(dataStore)
        this.store = new MountStore([
          {
            prefix: new Key(blockStoreDirectory),
            datastore: blockStore
          },
          {
            prefix: new Key('/'),
            datastore: dataStore
          }
        ])

        this.blockstore = blockstore(this)
        this.closed = false
        cb()
      }
    ], (err) => {
      if (err && this.lockfile) {
        return this.lockfile.close((err2) => {
          log('error removing lock', err2)
          callback(err)
        })
      }

      callback(err)
    })
  }

  /**
   * Check if the repo is already initialized.
   *
   * @private
   * @param {function(Error)} callback
   * @returns {void}
   */
  _isInitialized (callback) {
    log('init check')
    parallel([
      (cb) => this.config.exists(cb),
      (cb) => this.version.check(repoVersion, cb)
    ], (err, res) => {
      log('init', err, res)
      if (err) {
        return callback(err)
      }

      if (!res[0]) {
        return callback(new Error('repo is not initialized yet'))
      }
      callback()
    })
  }

  /**
   * Close the repo and cleanup.
   *
   * @param {function(Error)} callback
   * @returns {void}
   */
  close (callback) {
    if (this.closed) {
      return callback(new Error('repo is already closed'))
    }

    log('closing at: %s', this.path)
    series([
      (cb) => this._blockStore.delete(apiFile, (err) => {
        if (err && err.message.startsWith('ENOENT')) {
          return cb()
        }
        cb(err)
      }),
      (cb) => this.store.close(cb),
      (cb) => console.log('closing block...') || this._blockStore.close(cb),
      (cb) => {
        console.log('lock:', this.lockfile)
        log('unlocking')
        this.closed = true
        this.lockfile.close(cb)
      },
      (cb) => {
        this.lockfile = null
        cb()
      }
    ], (err) => callback(err))
  }

  /**
   * Check if a repo exists.
   *
   * @param {function(Error, bool)} callback
   * @returns {void}
   */
  exists (callback) {
    this.version.exists(callback)
  }

  /**
   * Set the api address, by writing it to the `/api` file.
   *
   * @param {Multiaddr} addr
   * @param {function(Error)} callback
   * @returns {void}
   */
  setApiAddress (addr, callback) {
    this._blockStore.put(apiFile, Buffer.from(addr.toString()), callback)
  }

  /**
   * Returns the registered API address, according to the `/api` file in this respo.
   *
   * @param {function(Error, Mulitaddr)} callback
   * @returns {void}
   */
  apiAddress (callback) {
    this._blockStore.get(apiFile, (err, rawAddr) => {
      if (err) {
        return callback(err)
      }

      callback(null, new Multiaddr(rawAddr.toString()))
    })
  }
}

module.exports = IpfsRepo
