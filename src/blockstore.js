'use strict'

const { shard, ShardingDatastore } = require('datastore-core')
const { cidToKey, keyToCid } = require('./blockstore-utils')
const drain = require('it-drain')
const pushable = require('it-pushable')

/**
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-store').Options} DatastoreOptions
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
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
  /** @type {Blockstore} */
  const bs = {
    open () {
      return store.open()
    },

    close () {
      return store.close()
    },

    async * query (query, options) {
      /** @type {import('interface-datastore').Query} */
      const storeQuery = {
        prefix: query.prefix,
        limit: query.limit,
        offset: query.offset,
        filters: (query.filters || []).map(filter => {
          return ({ key, value }) => filter({ key: keyToCid(key), value })
        }),
        orders: (query.orders || []).map(order => {
          return (a, b) => order({ key: keyToCid(a.key), value: a.value }, { key: keyToCid(b.key), value: b.value })
        })
      }

      for await (const { key, value } of store.query(storeQuery, options)) {
        yield { key: keyToCid(key), value }
      }
    },

    async * queryKeys (query, options) {
      /** @type {import('interface-datastore').KeyQuery} */
      const storeQuery = {
        prefix: query.prefix,
        limit: query.limit,
        offset: query.offset,
        filters: (query.filters || []).map(filter => {
          return (key) => filter(keyToCid(key))
        }),
        orders: (query.orders || []).map(order => {
          return (a, b) => order(keyToCid(a), keyToCid(b))
        })
      }

      for await (const key of store.queryKeys(storeQuery, options)) {
        yield keyToCid(key)
      }
    },

    async get (cid, options) {
      return store.get(cidToKey(cid), options)
    },

    async * getMany (cids, options) {
      for await (const cid of cids) {
        yield this.get(cid, options)
      }
    },

    async put (cid, buf, options) {
      const key = cidToKey(cid)
      const exists = await store.has(key, options)

      if (!exists) {
        await store.put(key, buf, options)
      }
    },

    async * putMany (pairs, options) { // eslint-disable-line require-await
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
            for await (const { key: cid, value } of pairs) {
              const key = cidToKey(cid)
              const exists = await store.has(key, options)

              if (!exists) {
                yield { key, value }
              }

              // there is an assumption here that after the yield has completed
              // the underlying datastore has finished writing the block
              output.push({ key: cid, value })
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
      const out = pushable()

      drain(store.deleteMany((async function * () {
        for await (const cid of cids) {
          yield cidToKey(cid)

          out.push(cid)
        }

        out.end()
      }()), options)).catch(err => {
        out.end(err)
      })

      return out
    },

    batch () {
      return {
        put (key, value) { },
        delete (key) { },
        commit: async (options) => { }
      }
    }
  }

  return bs
}
