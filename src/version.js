'use strict'

const Key = require('interface-datastore').Key
const debug = require('debug')
const log = debug('ipfs:repo:version')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')
const {
  hasWithFallback,
  getWithFallback
// @ts-ignore
} = require('ipfs-repo-migrations/src/utils')

const versionKey = new Key('version')

/**
 *
 * @param {import('interface-datastore').Datastore} store
 */
module.exports = (store) => {
  return {
    /**
     * Check if a version file exists.
     *
     */
    async exists () { // eslint-disable-line require-await
      // level-js@5.x cannot read keys from level-js@4.x dbs so fall back to
      // using IndexedDB API with string keys - only necessary until we do
      // the migratiion to v10 or above
      return hasWithFallback(versionKey, store.has.bind(store), store)
    },
    /**
     * Get the current version.
     *
     * @returns {Promise<number>}
     */
    async get () {
      // level-js@5.x cannot read keys from level-js@4.x dbs so fall back to
      // using IndexedDB API with string keys - only necessary until we do
      // the migratiion to v10 or above
      const buf = await getWithFallback(versionKey, store.get.bind(store), store.has.bind(store), store)
      return parseInt(uint8ArrayToString(buf), 10)
    },
    /**
     * Set the version of the repo, writing it to the underlying store.
     *
     * @param {number} version
     * @returns {Promise<void>}
     */
    set (version) {
      return store.put(versionKey, uint8ArrayFromString(String(version)))
    },
    /**
     * Check the current version, and returns true if versions matches
     *
     * @param {number} expected
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
