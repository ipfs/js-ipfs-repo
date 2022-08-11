
import { Key } from 'interface-datastore/key'
import PQueue from 'p-queue'
import _get from 'just-safe-get'
import _set from 'just-safe-set'
import errCode from 'err-code'
import { NotFoundError } from './errors.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { getWithFallback, hasWithFallback } from './utils/level.js'

// @ts-ignore types are broken in p-queue@6.x.x - also, if we imported via esm
// we can use the default, if via cjs we need to get the default via prop access
const Queue = PQueue.default ? PQueue.default : PQueue

const configKey = new Key('config')

/**
 * @typedef {import('./types').Config} Config
 * @typedef {import('interface-datastore').Datastore} Datastore
 */

/**
 * @param {Datastore} store
 */
export function config (store) {
  const setQueue = new Queue({ concurrency: 1 })

  const configStore = {
    /**
     * Get the current configuration from the repo.
     *
     * @param {object} [options] - options
     * @param {AbortSignal} [options.signal] - abort this config read
     * @returns {Promise<Config>}
     */
    async getAll (options = {}) { // eslint-disable-line require-await
      // level-js@5.x cannot read keys from level-js@4.x dbs so fall back to
      // using IndexedDB API with string keys - only necessary until we do
      // the migratiion to v10 or above
      const encodedValue = await getWithFallback(configKey, store.get.bind(store), store.has.bind(store), store)

      return JSON.parse(uint8ArrayToString(encodedValue))
    },

    /**
     * Get the value for the passed configuration key from the repo.
     *
     * @param {string} key - the config key to get
     * @param {object} [options] - options
     * @param {AbortSignal} [options.signal] - abort this config read
     */
    async get (key, options = {}) {
      if (key == null) {
        throw new NotFoundError(`Key ${key} does not exist in config`)
      }

      const config = await this.getAll(options)
      const value = _get(config, key)

      if (value === undefined) {
        throw new NotFoundError(`Key ${key} does not exist in config`)
      }

      return value
    },

    /**
     * Set the current configuration for this repo.
     *
     * @param {string} key - the config key to be written
     * @param {any} [value] - the config value to be written
     * @param {object} [options] - options
     * @param {AbortSignal} [options.signal] - abort this config write
     */
    set (key, value, options = {}) {
      // @ts-ignore ts thinks key will only be a string, but it may not be
      if (typeof key !== 'string' && !(key instanceof String)) {
        throw errCode(new Error('Invalid key type: ' + typeof key), 'ERR_INVALID_KEY')
      }

      if (value === undefined || (value instanceof Uint8Array)) {
        throw errCode(new Error('Invalid value type: ' + typeof value), 'ERR_INVALID_VALUE')
      }

      return setQueue.add(() => _maybeDoSet({
        key: key,
        value: value
      }, options.signal))
    },

    /**
     * Set the current configuration for this repo.
     *
     * @param {Config} [value] - the config value to be written
     * @param {object} [options] - options
     * @param {AbortSignal} [options.signal] - abort this config write
     */
    replace (value, options = {}) {
      if (!value || (value instanceof Uint8Array)) {
        throw errCode(new Error('Invalid value type: ' + typeof value), 'ERR_INVALID_VALUE')
      }

      return setQueue.add(() => _maybeDoSet({
        key: undefined,
        value: value
      }, options.signal))
    },

    /**
     * Check if a config file exists.
     *
     */
    async exists () { // eslint-disable-line require-await
      // level-js@5.x cannot read keys from level-js@4.x dbs so fall back to
      // using IndexedDB API with string keys - only necessary until we do
      // the migration to v10 or above
      return hasWithFallback(configKey, store.has.bind(store), store)
    }
  }

  return configStore

  /**
   * @param {{ key: any; value: any; }} m
   * @param {AbortSignal | undefined} signal
   */
  async function _maybeDoSet (m, signal) {
    if (signal && signal.aborted) {
      return
    }

    const key = m.key
    const value = m.value
    if (key) {
      const config = await configStore.getAll()
      if (typeof config === 'object' && config !== null) {
        _set(config, key, value)
      }
      return _saveAll(config)
    }
    return _saveAll(value)
  }

  /**
   * @param {unknown} config
   */
  function _saveAll (config) {
    const buf = uint8ArrayFromString(JSON.stringify(config, null, 2))
    return store.put(configKey, buf)
  }
}
