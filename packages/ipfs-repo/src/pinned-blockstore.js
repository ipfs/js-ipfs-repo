
import map from 'it-map'
import errCode from 'err-code'
import { PinTypes } from './pin-types.js'

/**
 * @typedef {import('interface-datastore').Query} Query
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-datastore').Options} DatastoreOptions
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('./pin-manager').Pins} Pins
 */

/**
 * @param {Pins} pins
 * @param {Blockstore} store
 * @returns {Blockstore}
 */
export function createPinnedBlockstore (pins, store) {
  return {
    open () {
      return store.open()
    },

    close () {
      return store.close()
    },

    query (query, options) {
      return store.query(query, options)
    },

    queryKeys (query, options) {
      return store.queryKeys(query, options)
    },

    async get (cid, options) {
      return store.get(cid, options)
    },

    async * getMany (cids, options) {
      yield * store.getMany(cids, options)
    },

    async put (cid, buf, options) {
      await store.put(cid, buf, options)
    },

    async * putMany (pairs, options) {
      yield * store.putMany(pairs, options)
    },

    has (cid, options) {
      return store.has(cid, options)
    },

    async delete (cid, options) {
      await ensureNotPinned(cid, pins)

      return store.delete(cid, options)
    },

    deleteMany (cids, options) {
      return store.deleteMany(map(cids, async cid => {
        await ensureNotPinned(cid, pins)

        return cid
      }), options)
    },

    batch () {
      return store.batch()
    }
  }
}

/**
 * @param {CID} cid
 * @param {Pins} pins
 */
async function ensureNotPinned (cid, pins) {
  const { pinned, reason } = await pins.isPinnedWithType(cid, PinTypes.all)

  if (pinned) {
    throw errCode(new Error(`pinned: ${reason}`), 'ERR_BLOCK_PINNED')
  }
}
