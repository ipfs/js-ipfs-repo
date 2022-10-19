
import { CID } from 'multiformats/cid'
import { Key } from 'interface-datastore/key'
import debug from 'debug'
import length from 'it-length'
import { base32 } from 'multiformats/bases/base32'
import * as raw from 'multiformats/codecs/raw'
import * as mhd from 'multiformats/hashes/digest'

const log = debug('ipfs:repo:migrator:migration-8')

/**
 * @typedef {import('../../types').Migration} Migration
 * @typedef {import('interface-datastore').Datastore} Datastore
 */

/**
 * @param {*} blockstore
 * @returns {Datastore}
 */
function unwrap (blockstore) {
  if (blockstore.child) {
    return unwrap(blockstore.child)
  }

  return blockstore
}

/**
 * @param {Key} key
 */
function keyToMultihash (key) {
  try {
    const buf = base32.decode(`b${key.toString().toLowerCase().slice(1)}`)

    // Extract multihash from CID
    const multihash = CID.decode(buf).multihash.bytes

    // Encode and slice off multibase codec
    // Should be uppercase for interop with go
    const multihashStr = base32.encode(multihash).slice(1).toUpperCase()

    return new Key(`/${multihashStr}`, false)
  } catch (/** @type {any} */ err) {
    return key
  }
}

/**
 * @param {Key} key
 */
function keyToCid (key) {
  try {
    const buf = base32.decode(`b${key.toString().toLowerCase().slice(1)}`)
    const digest = mhd.decode(buf)

    // CID to Key
    const multihash = base32.encode(CID.createV1(raw.code, digest).bytes).slice(1)

    return new Key(`/${multihash.toUpperCase()}`, false)
  } catch {
    return key
  }
}

/**
 * @param {import('../../types').Backends} backends
 * @param {(percent: number, message: string) => void} onProgress
 * @param {(key: Key) => Key} keyFunction
 */
async function process (backends, onProgress, keyFunction) {
  const blockstore = backends.blocks
  await blockstore.open()

  const unwrapped = unwrap(blockstore)

  const blockCount = await length(unwrapped.queryKeys({
    filters: [(key) => {
      const newKey = keyFunction(key)

      return newKey.toString() !== key.toString()
    }]
  }))

  try {
    let counter = 0

    for await (const block of unwrapped.query({})) {
      const newKey = keyFunction(block.key)

      // If the Key is base32 CIDv0 then there's nothing to do
      if (newKey.toString() !== block.key.toString()) {
        counter += 1
        log(`Migrating Block from ${block.key} to ${newKey}`, await unwrapped.has(block.key))

        await unwrapped.delete(block.key)
        await unwrapped.put(newKey, block.value)

        onProgress((counter / blockCount) * 100, `Migrated Block from ${block.key} to ${newKey}`)
      }
    }
  } finally {
    await blockstore.close()
  }
}

/** @type {Migration} */
export const migration = {
  version: 8,
  description: 'Transforms key names into base32 encoding and converts Block store to use bare multihashes encoded as base32',
  migrate: (backends, onProgress = () => {}) => {
    return process(backends, onProgress, keyToMultihash)
  },
  revert: (backends, onProgress = () => {}) => {
    return process(backends, onProgress, keyToCid)
  }
}
