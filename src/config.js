'use strict'

const Key = require('interface-datastore').Key
const { default: Queue } = require('p-queue')
const _get = require('just-safe-get')
const _set = require('just-safe-set')
const _has = require('lodash.has')
const errcode = require('err-code')
const errors = require('./errors')

const configKey = new Key('config')

module.exports = (store) => {
  const setQueue = new Queue({ concurrency: 1 })

  const configStore = {
    /**
     * Get the current configuration from the repo.
     *
     * @param {String} key - the config key to get
     * @returns {Promise<Object>}
     */
    async get (key) {
      if (!key) {
        key = undefined
      }

      const encodedValue = await store.get(configKey)
      const config = JSON.parse(encodedValue.toString())
      if (key !== undefined && !_has(config, key)) {
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
     * @returns {void}
     */
    async set (key, value) { // eslint-disable-line require-await
      if (arguments.length === 1) {
        value = key
        key = undefined
      } else if (!key || typeof key !== 'string') {
        throw errcode(new Error('Invalid key type: ' + typeof key), 'ERR_INVALID_KEY')
      }

      if (value === undefined || Buffer.isBuffer(value)) {
        throw errcode(new Error('Invalid value type: ' + typeof value), 'ERR_INVALID_VALUE')
      }

      return setQueue.add(() => _doSet({
        key: key,
        value: value
      }))
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

  async function _doSet (m) {
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
    const buf = Buffer.from(JSON.stringify(config, null, 2))
    return store.put(configKey, buf)
  }
}
