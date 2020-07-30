'use strict'

const Key = require('interface-datastore').Key
const debug = require('debug')
const log = debug('ipfs:repo:version')
const uint8ArrayToString = require('ipfs-utils/src/uint8arrays/to-string')
const uint8ArrayFromString = require('ipfs-utils/src/uint8arrays/from-string')

const versionKey = new Key('version')

module.exports = (store) => {
  return {
    /**
     * Check if a version file exists.
     *
     * @returns {Promise<bool>}
     */
    async exists () { // eslint-disable-line require-await
      return store.has(versionKey)
    },
    /**
     * Get the current version.
     *
     * @returns {Promise<Integer>}
     */
    async get () {
      const buf = await store.get(versionKey)
      return parseInt(uint8ArrayToString(buf), 10)
    },
    /**
     * Set the version of the repo, writing it to the underlying store.
     *
     * @param {number} version
     * @returns {Promise<void>}
     */
    async set (version) { // eslint-disable-line require-await
      return store.put(versionKey, uint8ArrayFromString(String(version)))
    },
    /**
     * Check the current version, and returns true if versions matches
     * @param {number} expected
     * @returns {boolean}
     */
    async check (expected) {
      const version = await this.get()
      log('comparing version: %s and %s', version, expected)
      // Version 6 and 7 are the same
      // TODO: Clean up the compatibility logic. Repo feature detection would be ideal, or a better version schema
      const compatibleVersion = (version === 6 && expected === 7) || (expected === 6 && version === 7)

      return version === expected || compatibleVersion
    }
  }
}
