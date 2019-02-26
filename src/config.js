'use strict'

const Key = require('interface-datastore').Key
const queue = require('async/queue')
const _get = require('lodash.get')
const _set = require('lodash.set')
const _has = require('lodash.has')
const Buffer = require('safe-buffer').Buffer

const configKey = new Key('config')

module.exports = (store) => {
  const setQueue = queue(_doSet, 1)
  setQueue.error = (err) => { throw err }

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
      return store.get(configKey)
        .then((encodedValue) => {
          const config = JSON.parse(encodedValue.toString())
          if (key !== undefined && !_has(config, key)) {
            throw new Error(`Key ${key} does not exist in config`)
          }
          const value = key !== undefined ? _get(config, key) : config
          return value
        })
    },
    /**
     * Set the current configuration for this repo.
     *
     * @param {String} key - the config key to be written
     * @param {Object} value - the config value to be written
     * @returns {void}
     */
    set (key, value) {
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key type')
      }

      if (value === undefined || Buffer.isBuffer(value)) {
        throw new Error('Invalid value type')
      }

      setQueue.push({
        key: key,
        value: value
      })
    },

    /**
     * Check if a config file exists.
     *
     * @returns {Promise<bool>}
     */
    async exists () {
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
      await _saveAll(config)
    }
  }

  function _saveAll (config) {
    const buf = Buffer.from(JSON.stringify(config, null, 2))
    return store.put(configKey, buf)
  }
}
