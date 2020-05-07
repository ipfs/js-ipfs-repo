'use strict'

const core = require('datastore-core')
const ShardingStore = core.ShardingDatastore
const Block = require('ipld-block')
const { cidToKey } = require('./blockstore-utils')

module.exports = async (filestore, options) => {
  const store = await maybeWithSharding(filestore, options)
  return createBaseStore(store)
}

function maybeWithSharding (filestore, options) {
  if (options.sharding) {
    const shard = new core.shard.NextToLast(2)
    return ShardingStore.createOrOpen(filestore, shard)
  }
  return filestore
}

function createBaseStore (store) {
  return {
    /**
     * Query the store.
     *
     * @param {Object} query
     * @param {Object} options
     * @returns {AsyncIterator<Block>}
     */
    async * query (query, options) { // eslint-disable-line require-await
      yield * store.query(query, options)
    },
    /**
     * Get a single block by CID.
     *
     * @param {CID} cid
     * @param {Object} options
     * @returns {Promise<Block>}
     */
    async get (cid, options) {
      const key = cidToKey(cid)
      let blockData
      try {
        blockData = await store.get(key, options)
        return new Block(blockData, cid)
      } catch (err) {
        if (err.code === 'ERR_NOT_FOUND') {
          const otherCid = cidToOtherVersion(cid)

          if (!otherCid) {
            throw err
          }

          const otherKey = cidToKey(otherCid)
          const blockData = await store.get(otherKey, options)
          await store.put(key, blockData)
          return new Block(blockData, cid)
        }

        throw err
      }
    },
    /**
     * Like get, but for more.
     *
     * @param {AsyncIterator<CID>} cids
     * @param {Object} options
     * @returns {AsyncIterator<Block>}
     */
    async * getMany (cids, options) {
      for await (const cid of cids) {
        yield this.get(cid, options)
      }
    },
    /**
     * Write a single block to the store.
     *
     * @param {Block} block
     * @param {Object} options
     * @returns {Promise<void>}
     */
    async put (block, options) {
      if (!Block.isBlock(block)) {
        throw new Error('invalid block')
      }

      const k = cidToKey(block.cid)
      const exists = await store.has(k, options)

      if (exists) {
        return
      }

      await store.put(k, block.data, options)

      return block
    },

    /**
     * Like put, but for more.
     *
     * @param {AsyncIterable<Block>|Iterable<Block>} blocks
     * @param {Object} options
     * @returns {Promise<void>}
     */
    async * putMany (blocks, options) { // eslint-disable-line require-await
      yield * store.putMany((async function * () {
        for await (const block of blocks) {
          const key = cidToKey(block.cid)

          if (await store.has(key, options)) {
            continue
          }

          yield { key, value: block.data }
        }
      }()), options)
    },
    /**
     * Does the store contain block with this cid?
     *
     * @param {CID} cid
     * @param {Object} options
     * @returns {Promise<bool>}
     */
    async has (cid, options) {
      const exists = await store.has(cidToKey(cid), options)
      if (exists) return exists
      const otherCid = cidToOtherVersion(cid)
      if (!otherCid) return false
      return store.has(cidToKey(otherCid), options)
    },
    /**
     * Delete a block from the store
     *
     * @param {CID} cid
     * @param {Object} options
     * @returns {Promise<void>}
     */
    async delete (cid, options) { // eslint-disable-line require-await
      return store.delete(cidToKey(cid), options)
    },
    /**
     * Delete a block from the store
     *
     * @param {AsyncIterable<CID>} cids
     * @param {Object} options
     * @returns {Promise<void>}
     */
    async * deleteMany (cids, options) { // eslint-disable-line require-await
      yield * store.deleteMany((async function * () {
        for await (const cid of cids) {
          yield cidToKey(cid)
        }
      }()), options)
    },
    /**
     * Close the store
     *
     * @returns {Promise<void>}
     */
    async close () { // eslint-disable-line require-await
      return store.close()
    }
  }
}

function cidToOtherVersion (cid) {
  try {
    return cid.version === 0 ? cid.toV1() : cid.toV0()
  } catch (err) {
    return null
  }
}
