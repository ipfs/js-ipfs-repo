
import { Key } from 'interface-datastore/key'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

const apiFile = new Key('api')

/**
 *
 * @param {import('interface-datastore').Datastore} store
 */
export function apiAddr (store) {
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
     * TODO: fix find the proper type or remove this API
     *
     * @param {string} value - the api address to be written
     */
    set (value) {
      return store.put(apiFile, uint8ArrayFromString(value.toString()))
    },
    /**
     * Deletes api file
     */
    delete () {
      return store.delete(apiFile)
    }
  }
}
