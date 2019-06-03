'use strict'

const Key = require('interface-datastore').Key
const debug = require('debug')
const log = debug('repo:version')
const errcode = require('err-code')

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
      return parseInt(buf.toString().trim(), 10)
    },
    /**
     * Set the version of the repo, writing it to the underlying store.
     *
     * @param {number} version
     * @returns {Promise<void>}
     */
    async set (version) { // eslint-disable-line require-await
      return store.put(versionKey, Buffer.from(String(version)))
    },
    /**
     * Check the current version, and return an error on missmatch
     * @param {number} expected
     * @returns {void}
     */
    async check (expected) {
      const version = await this.get()
      log('comparing version: %s and %s', version, expected)
      // Version 6 and 7 are the same
      // TODO: Clean up the compatibility logic. Repo feature detection would be ideal, or a better version schema
      const compatibleVersion = (version === 6 && expected === 7) || (expected === 6 && version === 7)

      if (version !== expected && !compatibleVersion) {
        throw errcode(new Error(`ipfs repo needs migration: expected version v${expected}, found version v${version}`), 'ERR_INVALID_REPO_VERSION')
      }
    }
  }
}
