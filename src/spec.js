'use strict'

const Key = require('interface-datastore').Key
const sortKeys = require('sort-keys')
const callbackify = require('callbackify')

const specKey = new Key('datastore_spec')

module.exports = (store) => {
  const specStore = {
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
     * @returns {Promise<Buffer>}
     */
    async get () {
      const buf = await store.get(specKey)
      return JSON.parse(buf.toString())
    },
    /**
     * Set the datastore spec of the repo, writing it to the underlying store.
     * TODO unclear on what the type should be or if it's required
     * @param {number} spec
     * @returns {Promise<void>}
     */
    async set (spec) { // eslint-disable-line require-await
      return store.put(specKey, Buffer.from(JSON.stringify(sortKeys(spec, { deep: true }))))
    }
  }
  const callbackifiedSpecStore = {
    get: callbackify(specStore.get),
    set: callbackify(specStore.set),
    exists: callbackify(specStore.exists)
  }

  return callbackifiedSpecStore
}
