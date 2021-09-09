import debug from 'debug'
import { createUnsafe } from 'multiformats/block'

const log = debug('ipfs:repo:utils:walk-dag')

/**
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 * @typedef {import('../types').loadCodec} loadCodec
 * @typedef {import('../types').AbortOptions} AbortOptions
 */

/**
 * @param {CID} cid
 * @param {Blockstore} blockstore
 * @param {loadCodec} loadCodec
 * @param {AbortOptions} [options]
 * @returns {AsyncGenerator<CID, void, undefined>}
 */
export async function * walkDag (cid, blockstore, loadCodec, options) {
  try {
    const bytes = await blockstore.get(cid, options)
    const codec = await loadCodec(cid.code)
    const block = createUnsafe({ bytes, cid, codec })

    for (const [, childCid] of block.links()) {
      yield childCid
      yield * walkDag(childCid, blockstore, loadCodec, options)
    }
  } catch (/** @type {any} */ err) {
    log('Could not walk DAG for CID', cid.toString(), err)

    throw err
  }
}
