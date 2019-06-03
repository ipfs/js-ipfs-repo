'use strict'

const Key = require('interface-datastore').Key

const apiFile = new Key('api')

module.exports = (store) => {
  return {
    /**
     * Get the current configuration from the repo.
     *
     * @returns {Promise<String>}
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
      return store.put(apiFile, Buffer.from(value.toString()))
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
