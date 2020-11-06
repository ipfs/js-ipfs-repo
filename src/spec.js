'use strict'

const Key = require('interface-datastore').Key
const sortKeys = require('sort-keys')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')

const specKey = new Key('datastore_spec')

module.exports = (store) => {
  return {
    /**
     * Check if a datastore spec file exists.
     *
     * @returns {Promise<bool>}
     */
    async exists () { // eslint-disable-line require-await
      return store.has(specKey)
    },
    /**
     * Get the current datastore spec.
     *
     * @returns {Promise<Uint8Array>}
     */
    async get () {
      const buf = await store.get(specKey)
      return JSON.parse(uint8ArrayToString(buf))
    },
    /**
     * Set the datastore spec of the repo, writing it to the underlying store.
     * TODO unclear on what the type should be or if it's required
     *
     * @param {number} spec
     * @returns {Promise<void>}
     */
    async set (spec) { // eslint-disable-line require-await
      return store.put(specKey, uint8ArrayFromString(JSON.stringify(sortKeys(spec, { deep: true }))))
    }
  }
}
