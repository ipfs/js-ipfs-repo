'use strict'

const Key = require('interface-datastore').Key
const { default: Queue } = require('p-queue')
const _get = require('just-safe-get')
const _set = require('just-safe-set')
const errcode = require('err-code')
const errors = require('./errors')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')
const {
  hasWithFallback,
  getWithFallback
} = require('ipfs-repo-migrations/src/utils')

const configKey = new Key('config')

module.exports = (store) => {
  const setQueue = new Queue({ concurrency: 1 })

  const configStore = {
    /**
     * Get the current configuration from the repo.
     *
     * @param {Object} options - options
     * @param {AbortSignal} options.signal - abort this config read
     * @returns {Promise<Object>}
     */
    async getAll (options = {}) { // eslint-disable-line require-await
      return configStore.get(undefined, options)
    },

    /**
     * Get the value for the passed configuration key from the repo.
     *
     * @param {string} key - the config key to get
     * @param {Object} options - options
     * @param {AbortSignal} options.signal - abort this config read
     * @returns {Promise<Object>}
     */
    async get (key, options = {}) {
      if (!key) {
        key = undefined
      }

      // level-js@5.x cannot read keys from level-js@4.x dbs so fall back to
      // using IndexedDB API with string keys - only necessary until we do
      // the migratiion to v10 or above
      const encodedValue = await getWithFallback(configKey, store.get.bind(store), store.has.bind(store), store)

      if (options.signal && options.signal.aborted) {
        return
      }

      const config = JSON.parse(uint8ArrayToString(encodedValue))
      if (key !== undefined && _get(config, key) === undefined) {
        throw new errors.NotFoundError(`Key ${key} does not exist in config`)
      }

      const value = key !== undefined ? _get(config, key) : config
      return value
    },

    /**
     * Set the current configuration for this repo.
     *
     * @param {string} key - the config key to be written
     * @param {Object} value - the config value to be written
     * @param {Object} options - options
     * @param {AbortSignal} options.signal - abort this config write
     * @returns {void}
     */
    async set (key, value, options = {}) { // eslint-disable-line require-await
      if (arguments.length === 1) {
        value = key
        key = undefined
      } else if (!key || typeof key !== 'string') {
        throw errcode(new Error('Invalid key type: ' + typeof key), 'ERR_INVALID_KEY')
      }

      if (value === undefined || (value instanceof Uint8Array)) {
        throw errcode(new Error('Invalid value type: ' + typeof value), 'ERR_INVALID_VALUE')
      }

      return setQueue.add(() => _maybeDoSet({
        key: key,
        value: value
      }, options.signal))
    },

    /**
     * Set the current configuration for this repo.
     *
     * @param {Object} value - the config value to be written
     * @param {Object} options - options
     * @param {AbortSignal} options.signal - abort this config write
     * @returns {void}
     */
    async replace (value, options = {}) { // eslint-disable-line require-await
      if (!value || (value instanceof Uint8Array)) {
        throw errcode(new Error('Invalid value type: ' + typeof value), 'ERR_INVALID_VALUE')
      }

      return setQueue.add(() => _maybeDoSet({
        key: undefined,
        value: value
      }, options.signal))
    },

    /**
     * Check if a config file exists.
     *
     * @returns {Promise<bool>}
     */
    async exists () { // eslint-disable-line require-await
      // level-js@5.x cannot read keys from level-js@4.x dbs so fall back to
      // using IndexedDB API with string keys - only necessary until we do
      // the migratiion to v10 or above
      return hasWithFallback(configKey, store.has.bind(store), store)
    }
  }

  return configStore

  async function _maybeDoSet (m, signal) {
    if (signal && signal.aborted) {
      return
    }

    const key = m.key
    const value = m.value
    if (key) {
      const config = await configStore.get()
      _set(config, key, value)
      return _saveAll(config)
    }
    return _saveAll(value)
  }

  function _saveAll (config) {
    const buf = uint8ArrayFromString(JSON.stringify(config, null, 2))
    return store.put(configKey, buf)
  }
}
