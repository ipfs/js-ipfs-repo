'use strict'

const Key = require('interface-datastore').Key
const sortKeys = require('sort-keys')

const specKey = new Key('datastore_spec')

module.exports = (store) => {
  return {
    /**
     * Check if a datastore spec file exists.
     *
     * @returns {Promise<bool>}
     */
    exists () {
      return store.has(specKey)
    },
    /**
     * Get the current datastore spec.
     *
     * @returns {Promise<Buffer>}
     */
    get () {
      return store.get()
        .then(buf => JSON.parse(buf.toString()))
    },
    /**
     * Set the datastore spec of the repo, writing it to the underlying store.
     * TODO unclear on what the type should be or if it's required
     * @param {number} spec
     * @returns {Promise<void>}
     */
    set (spec) {
      return store.put(specKey, Buffer.from(JSON.stringify(sortKeys(spec, { deep: true }))))
    }
  }
}
