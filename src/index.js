'use strict'

const waterfall = require('async/waterfall')
const series = require('async/series')
const parallel = require('async/parallel')
const each = require('async/each')
const assert = require('assert')
const path = require('path')
const debug = require('debug')

const backends = require('./backends')
const version = require('./version')
const config = require('./config')
const apiAddr = require('./api-addr')
const blockstore = require('./blockstore')
const defaultOptions = require('./default-options')

const log = debug('repo')

const lockers = {
  memory: require('./lock-memory'),
  fs: require('./lock')
}

const repoVersion = 5

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
    assert.equal(typeof repoPath, 'string', 'missing repoPath')

    this.options = buildOptions(options)
    this.closed = true
    this.path = repoPath

    this._locker = lockers[this.options.lock]
    assert(this._locker, 'Unknown lock type: ' + this.options.lock)

    this.root = backends.create('root', this.path, this.options)
    this.version = version(this.root)
    this.config = config(this.root)
    this.apiAddr = apiAddr(this.root)
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
      (cb) => this.root.open(ignoringAlreadyOpened(cb)),
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
      setImmediate(() => callback(new Error('repo is already open')))
      return // early
    }
    log('opening at: %s', this.path)

    // check if the repo is already initialized
    waterfall([
      (cb) => this.root.open(ignoringAlreadyOpened(cb)),
      (cb) => this._isInitialized(cb),
      (cb) => this._locker.lock(this.path, cb),
      (lck, cb) => {
        log('aquired repo.lock')
        this.lockfile = lck
        cb()
      },
      (cb) => {
        log('creating datastore')
        this.datastore = backends.create('datastore', path.join(this.path, 'datastore'), this.options)
        log('creating blocks')
        const blocksBaseStore = backends.create('blocks', path.join(this.path, 'blocks'), this.options)
        blockstore(
          blocksBaseStore,
          this.options.storageBackendOptions.blocks,
          cb)
      },
      (blocks, cb) => {
        this.blocks = blocks
        cb()
      },
      (cb) => {
        this.closed = false
        log('all opened')
        cb()
      }
    ], (err) => {
      if (err && this.lockfile) {
        this.lockfile.close((err2) => {
          if (!err2) {
            this.lockfile = null
          } else {
            log('error removing lock', err2)
          }
          callback(err)
        })
      } else {
        callback(err)
      }
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
    parallel(
      {
        config: (cb) => this.config.exists(cb),
        version: (cb) => this.version.check(repoVersion, cb)
      },
      (err, res) => {
        log('init', err, res)
        if (err) {
          return callback(err)
        }

        if (!res.config) {
          return callback(new Error('repo is not initialized yet'))
        }
        callback()
      }
    )
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
      (cb) => this.apiAddr.delete(ignoringNotFound(cb)),
      (cb) => {
        each(
          [this.blocks, this.datastore],
          (store, callback) => store.close(callback),
          cb)
      },
      (cb) => {
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
}

module.exports = IpfsRepo

function ignoringIf (cond, cb) {
  return (err) => {
    cb(err && !cond(err) ? err : null)
  }
}
function ignoringAlreadyOpened (cb) {
  return ignoringIf((err) => err.message === 'Already open', cb)
}

function ignoringNotFound (cb) {
  return ignoringIf((err) => err.message.startsWith('ENOENT'), cb)
}

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
