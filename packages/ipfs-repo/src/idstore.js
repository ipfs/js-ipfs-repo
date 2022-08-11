
import filter from 'it-filter'
import { pushable } from 'it-pushable'
import drain from 'it-drain'
import { CID } from 'multiformats/cid'
import errCode from 'err-code'
import { identity } from 'multiformats/hashes/identity'

/**
 * @typedef {import('interface-datastore').Query} Query
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-datastore').Options} DatastoreOptions
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 */

/**
 * @param {Blockstore} store
 * @returns {Blockstore}
 */
export function createIdStore (store) {
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
      const extracted = extractContents(cid)
      if (extracted.isIdentity) {
        return Promise.resolve(extracted.digest)
      }
      return store.get(cid, options)
    },

    async * getMany (cids, options) {
      for await (const cid of cids) {
        yield this.get(cid, options)
      }
    },

    async put (cid, buf, options) {
      const { isIdentity } = extractContents(cid)

      if (isIdentity) {
        return
      }

      await store.put(cid, buf, options)
    },

    async * putMany (pairs, options) {
      // in order to return all blocks. we're going to assemble a seperate iterable
      // return rather than return the resolves of store.putMany using the same
      // process used by blockstore.putMany
      const output = pushable({
        objectMode: true
      })

      // process.nextTick runs on the microtask queue, setImmediate runs on the next
      // event loop iteration so is slower. Use process.nextTick if it is available.
      const runner = globalThis.process && globalThis.process.nextTick ? globalThis.process.nextTick : (globalThis.setImmediate || globalThis.setTimeout)

      runner(async () => {
        try {
          await drain(store.putMany(async function * () {
            for await (const { key, value } of pairs) {
              if (!extractContents(key).isIdentity) {
                yield { key, value }
              }

              // if non identity blocks successfully write, blocks are included in output
              output.push({ key, value })
            }
          }()))

          output.end()
        } catch (/** @type {any} */ err) {
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

    batch () {
      const batch = store.batch()

      return {
        put (cid, buf) {
          const { isIdentity } = extractContents(cid)

          if (isIdentity) {
            return
          }

          batch.put(cid, buf)
        },
        delete (cid) {
          const { isIdentity } = extractContents(cid)

          if (isIdentity) {
            return
          }

          batch.delete(cid)
        },
        commit: (options) => {
          return batch.commit(options)
        }
      }
    }
  }
}

/**
 * @param {CID} k
 * @returns {{ isIdentity: false } | { isIdentity: true, digest: Uint8Array}}
 */
function extractContents (k) {
  const cid = CID.asCID(k)

  if (cid == null) {
    throw errCode(new Error('Not a valid cid'), 'ERR_INVALID_CID')
  }

  if (cid.multihash.code !== identity.code) {
    return {
      isIdentity: false
    }
  }

  return {
    isIdentity: true,
    digest: cid.multihash.digest
  }
}
