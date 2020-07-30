'use strict'

const Key = require('interface-datastore').Key
const { default: Queue } = require('p-queue')
const _get = require('just-safe-get')
const _set = require('just-safe-set')
const errcode = require('err-code')
const errors = require('./errors')
const uint8ArrayToString = require('ipfs-utils/src/uint8arrays/to-string')
const uint8ArrayFromString = require('ipfs-utils/src/uint8arrays/from-string')

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
     * @param {String} key - the config key to get
     * @param {Object} options - options
     * @param {AbortSignal} options.signal - abort this config read
     * @returns {Promise<Object>}
     */
    async get (key, options = {}) {
      if (!key) {
        key = undefined
      }

      const encodedValue = await store.get(configKey)

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
     * @param {String} key - the config key to be written
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
      return store.has(configKey)
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
