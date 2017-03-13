'use strict'

const Key = require('interface-datastore').Key

const configKey = new Key('config')

module.exports = (store) => {
  return {
    /**
     * Get the current configuration from the repo.
     *
     * @param {function(Error, Object)} callback
     * @returns {void}
     */
    get (callback) {
      store.get(configKey, (err, value) => {
        if (err) {
          return callback(err)
        }

        let config
        try {
          config = JSON.parse(value.toString())
        } catch (err) {
          return callback(err)
        }
        callback(null, config)
      })
    },
    /**
     * Set the current configuration for this repo.
     *
     * @param {Object} config - the config object to be written
     * @param {function(Error)} callback
     * @returns {void}
     */
    set (config, callback) {
      const buf = new Buffer(JSON.stringify(config, null, 2))

      store.put(configKey, buf, callback)
    },
    /**
     * Check if a config file exists.
     *
     * @param {function(Error, bool)} callback
     * @returns {void}
     */
    exists (callback) {
      store.has(configKey, callback)
    }
  }
}
