'use strict'

const Block = require('ipld-block')
const filter = require('it-filter')
const mh = require('multihashes')
const pushable = require('it-pushable')
const drain = require('it-drain')
const CID = require('cids')
const errcode = require('err-code')

/**
 * @typedef {import('interface-datastore').Query} Query
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-datastore').Options} DatastoreOptions
 * @typedef {import('./types').Blockstore} Blockstore
 */

/**
 *
 * @param {Blockstore} blockstore
 */
module.exports = createIdStore

/**
 * @param {Blockstore} store
 * @returns {Blockstore}
 */
function createIdStore (store) {
  return {
    open () {
      return store.open()
    },

    query (query, options) {
      return store.query(query, options)
    },

    queryKeys (query, options) {
      return store.queryKeys(query, options)
    },

    async get (cid, options) {
      const extracted = extractContents(cid)
      if (extracted.isIdentity) {
        return Promise.resolve(new Block(extracted.digest, cid))
      }
      return store.get(cid, options)
    },

    async * getMany (cids, options) {
      for await (const cid of cids) {
        yield this.get(cid, options)
      }
    },

    async put (block, options) {
      const { isIdentity } = extractContents(block.cid)
      if (isIdentity) {
        return Promise.resolve(block)
      }
      return store.put(block, options)
    },

    async * putMany (blocks, options) {
      // in order to return all blocks. we're going to assemble a seperate iterable
      // return rather than return the resolves of store.putMany using the same
      // process used by blockstore.putMany
      const output = pushable()

      // process.nextTick runs on the microtask queue, setImmediate runs on the next
      // event loop iteration so is slower. Use process.nextTick if it is available.
      const runner = process && process.nextTick ? process.nextTick : setImmediate

      runner(async () => {
        try {
          await drain(store.putMany(async function * () {
            for await (const block of blocks) {
              if (!extractContents(block.cid).isIdentity) {
                yield block
              }
              // if non identity blocks successfully write, blocks are included in output
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
      const { isIdentity } = extractContents(cid)
      if (isIdentity) {
        return Promise.resolve(true)
      }
      return store.has(cid, options)
    },

    delete (cid, options) {
      const { isIdentity } = extractContents(cid)
      if (isIdentity) {
        return Promise.resolve()
      }
      return store.delete(cid, options)
    },

    deleteMany (cids, options) {
      return store.deleteMany(filter(cids, (cid) => !extractContents(cid).isIdentity), options)
    },

    close () {
      return store.close()
    }
  }
}

/**
 * @param {CID} k
 * @returns {{ isIdentity: false } | { isIdentity: true, digest: Uint8Array}}
 */
function extractContents (k) {
  if (!CID.isCID(k)) {
    throw errcode(new Error('Not a valid cid'), 'ERR_INVALID_CID')
  }

  // Pre-check by calling Prefix(), this much faster than extracting the hash.
  const decoded = mh.decode(k.multihash)

  if (decoded.name !== 'identity') {
    return {
      isIdentity: false
    }
  }

  return {
    isIdentity: true,
    digest: decoded.digest
  }
}
