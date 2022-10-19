
import { CID } from 'multiformats/cid'
import * as dagPb from '@ipld/dag-pb'
import * as cbor from 'cborg'
import * as pinset from './pin-set.js'
import { cidToKey, PIN_DS_KEY, PinTypes } from './utils.js'
import length from 'it-length'
import { sha256 } from 'multiformats/hashes/sha2'
import * as mhd from 'multiformats/hashes/digest'
import { base32 } from 'multiformats/bases/base32'

/**
 * @typedef {import('../../types').Migration} Migration
 * @typedef {import('../../types').MigrationProgressCallback} MigrationProgressCallback
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 * @typedef {import('multiformats/cid').Version} CIDVersion
 */

/**
 * @param {Blockstore} blockstore
 * @param {Datastore} datastore
 * @param {Datastore} pinstore
 * @param {MigrationProgressCallback} onProgress
 */
async function pinsToDatastore (blockstore, datastore, pinstore, onProgress) {
  if (!await datastore.has(PIN_DS_KEY)) {
    return
  }

  const mh = await datastore.get(PIN_DS_KEY)
  const cid = CID.decode(mh)
  const pinRootBuf = await blockstore.get(cid)
  const pinRoot = dagPb.decode(pinRootBuf)
  let counter = 0
  const pinCount = (await length(pinset.loadSet(blockstore, pinRoot, PinTypes.recursive))) + (await length(pinset.loadSet(blockstore, pinRoot, PinTypes.direct)))

  for await (const cid of pinset.loadSet(blockstore, pinRoot, PinTypes.recursive)) {
    counter++

    /** @type {{ depth: number, version?: CIDVersion, codec?: number }} */
    const pin = {
      depth: Infinity
    }

    if (cid.version !== 0) {
      pin.version = cid.version
    }

    if (cid.code !== dagPb.code) {
      pin.codec = cid.code
    }

    await pinstore.put(cidToKey(cid), cbor.encode(pin))

    onProgress((counter / pinCount) * 100, `Migrated recursive pin ${cid}`)
  }

  for await (const cid of pinset.loadSet(blockstore, pinRoot, PinTypes.direct)) {
    counter++

    /** @type {{ depth: number, version?: CIDVersion, codec?: number }} */
    const pin = {
      depth: 0
    }

    if (cid.version !== 0) {
      pin.version = cid.version
    }

    if (cid.code !== dagPb.code) {
      pin.codec = cid.code
    }

    await pinstore.put(cidToKey(cid), cbor.encode(pin))

    onProgress((counter / pinCount) * 100, `Migrated direct pin ${cid}`)
  }

  await blockstore.delete(cid)
  await datastore.delete(PIN_DS_KEY)
}

/**
 * @param {Blockstore} blockstore
 * @param {Datastore} datastore
 * @param {Datastore} pinstore
 * @param {MigrationProgressCallback} onProgress
 */
async function pinsToDAG (blockstore, datastore, pinstore, onProgress) {
  const recursivePins = []
  const directPins = []
  let counter = 0
  const pinCount = await length(pinstore.queryKeys({}))

  for await (const { key, value } of pinstore.query({})) {
    counter++
    const pin = cbor.decode(value)
    const cid = CID.create(
      pin.version || 0,
      pin.codec || dagPb.code,
      mhd.decode(base32.decode('b' + key.toString().toLowerCase().split('/').pop()))
    )

    if (pin.depth === 0) {
      onProgress((counter / pinCount) * 100, `Reverted direct pin ${cid}`)

      directPins.push(cid)
    } else {
      onProgress((counter / pinCount) * 100, `Reverted recursive pin ${cid}`)

      recursivePins.push(cid)
    }
  }

  onProgress(100, 'Updating pin root')
  const pinRoot = {
    Links: [
      await pinset.storeSet(blockstore, PinTypes.direct, directPins),
      await pinset.storeSet(blockstore, PinTypes.recursive, recursivePins)
    ]
  }
  const buf = dagPb.encode(pinRoot)
  const digest = await sha256.digest(buf)
  const cid = CID.createV0(digest)

  await blockstore.put(cid, buf)
  await datastore.put(PIN_DS_KEY, cid.bytes)
}

/**
 * @param {import('../../types').Backends} backends
 * @param {MigrationProgressCallback} onProgress
 * @param {*} fn
 */
async function process (backends, onProgress, fn) {
  const blockstore = backends.blocks
  const datastore = backends.datastore
  const pinstore = backends.pins

  await blockstore.open()
  await datastore.open()
  await pinstore.open()

  try {
    await fn(blockstore, datastore, pinstore, onProgress)
  } finally {
    await pinstore.close()
    await datastore.close()
    await blockstore.close()
  }
}

/** @type {Migration} */
export const migration = {
  version: 9,
  description: 'Migrates pins to datastore',
  migrate: (backends, onProgress = () => {}) => {
    return process(backends, onProgress, pinsToDatastore)
  },
  revert: (backends, onProgress = () => {}) => {
    return process(backends, onProgress, pinsToDAG)
  }
}
