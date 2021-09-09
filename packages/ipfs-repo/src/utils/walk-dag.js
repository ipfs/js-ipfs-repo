'use strict'

const log = require('debug')('ipfs:repo:utils:walk-dag')
const Block = require('multiformats/block')

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
async function * walkDag (cid, blockstore, loadCodec, options) {
  try {
    const bytes = await blockstore.get(cid, options)
    const codec = await loadCodec(cid.code)
    const block = Block.createUnsafe({ bytes, cid, codec })

    for (const [, childCid] of block.links()) {
      yield childCid
      yield * walkDag(childCid, blockstore, loadCodec, options)
    }
  } catch (err) {
    log('Could not walk DAG for CID', cid.toString(), err)

    throw err
  }
}

module.exports = walkDag
