'use strict'

const Key = require('interface-datastore').Key
const uint8ArrayFromString = require('uint8arrays/from-string')

const apiFile = new Key('api')

module.exports = (store) => {
  return {
    /**
     * Get the current configuration from the repo.
     *
     * @returns {Promise<string>}
     */
    async get () {
      const value = await store.get(apiFile)
      return value && value.toString()
    },
    /**
     * Set the current configuration for this repo.
     *
     * @param {Object} value - the api address to be written
     * @returns {Promise<?>}
     */
    async set (value) { // eslint-disable-line require-await
      return store.put(apiFile, uint8ArrayFromString(value.toString()))
    },
    /**
     * Deletes api file
     *
     * @returns {Promise<void>}
     */
    async delete () { // eslint-disable-line require-await
      return store.delete(apiFile)
    }
  }
}
