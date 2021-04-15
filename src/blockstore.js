'use strict'

const { shard, ShardingDatastore } = require('datastore-core')
const Block = require('ipld-block')
const { cidToKey, keyToCid } = require('./blockstore-utils')
const map = require('it-map')
const drain = require('it-drain')
const pushable = require('it-pushable')
/**
 * @typedef {import('interface-datastore').Query} Query
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-datastore').Options} DatastoreOptions
 * @typedef {import('cids')} CID
 * @typedef {import('./types').Blockstore} Blockstore
 */

/**
 *
 * @param {Datastore} filestore
 * @param {*} options
 */
module.exports = (filestore, options) => {
  const store = maybeWithSharding(filestore, options)
  return createBaseStore(store)
}

/**
 * @param {Datastore} filestore
 * @param {{ sharding: any; }} options
 */
function maybeWithSharding (filestore, options) {
  if (options.sharding) {
    return new ShardingDatastore(filestore, new shard.NextToLast(2))
  }
  return filestore
}

/**
 * @param {Datastore | ShardingDatastore} store
 * @returns {Blockstore}
 */
function createBaseStore (store) {
  return {
    open () {
      return store.open()
    },

    async * query (query, options) {
      for await (const { key, value } of store.query(query, options)) {
        yield new Block(value, keyToCid(key))
      }
    },

    async * queryKeys (query, options) {
      for await (const key of store.queryKeys(query, options)) {
        yield keyToCid(key)
      }
    },

    async get (cid, options) {
      const key = cidToKey(cid)
      const blockData = await store.get(key, options)

      return new Block(blockData, cid)
    },

    async * getMany (cids, options) {
      for await (const cid of cids) {
        yield this.get(cid, options)
      }
    },

    async put (block, options) {
      if (!Block.isBlock(block)) {
        throw new Error('invalid block')
      }

      const key = cidToKey(block.cid)
      const exists = await store.has(key, options)

      if (!exists) {
        await store.put(key, block.data, options)
      }

      return block
    },

    async * putMany (blocks, options) { // eslint-disable-line require-await
      // we cannot simply chain to `store.putMany` because we convert a CID into
      // a key based on the multihash only, so we lose the version & codec and
      // cannot give the user back the CID they used to create the block, so yield
      // to `store.putMany` but return the actual block the user passed in.
      //
      // nb. we want to use `store.putMany` here so bitswap can control batching
      // up block HAVEs to send to the network - if we use multiple `store.put`s
      // it will not be able to guess we are about to `store.put` more blocks
      const output = pushable()

      // process.nextTick runs on the microtask queue, setImmediate runs on the next
      // event loop iteration so is slower. Use process.nextTick if it is available.
      const runner = process && process.nextTick ? process.nextTick : setImmediate

      runner(async () => {
        try {
          await drain(store.putMany(async function * () {
            for await (const block of blocks) {
              const key = cidToKey(block.cid)
              const exists = await store.has(key, options)

              if (!exists) {
                yield { key, value: block.data }
              }

              // there is an assumption here that after the yield has completed
              // the underlying datastore has finished writing the block
              output.push(block)
            }
          }()))

          output.end()
        } catch (err) {
          output.end(err)
        }
      })

      yield * output
    },

    has (cid, options) {
      return store.has(cidToKey(cid), options)
    },

    delete (cid, options) {
      return store.delete(cidToKey(cid), options)
    },

    deleteMany (cids, options) {
      return store.deleteMany(map(cids, cid => cidToKey(cid)), options)
    },

    close () {
      return store.close()
    }
  }
}
