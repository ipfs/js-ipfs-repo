'use strict'

const { CID } = require('multiformats/cid')
const log = require('debug')('ipfs:repo:gc')
const { Errors } = require('interface-datastore')
const ERR_NOT_FOUND = Errors.notFoundError().code
const parallelBatch = require('it-parallel-batch')
const { pipe } = require('it-pipe')
const merge = require('it-merge')
const map = require('it-map')
const filter = require('it-filter')
const { Key } = require('interface-datastore')
const { base32 } = require('multiformats/bases/base32')
const walkDag = require('./utils/walk-dag')

// Limit on the number of parallel block remove operations
const BLOCK_RM_CONCURRENCY = 256

const MFS_ROOT_KEY = new Key('/local/filesroot')

/**
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 * @typedef {import('./types').loadCodec} loadCodec
 */

/**
 * Perform mark and sweep garbage collection
 *
 * @param {object} config
 * @param {import('./types').GCLock} config.gcLock
 * @param {import('./pins').Pins} config.pins
 * @param {Blockstore} config.blockstore
 * @param {import('interface-datastore').Datastore} config.root
 * @param {loadCodec} config.loadCodec
 */
module.exports = ({ gcLock, pins, blockstore, root, loadCodec }) => {
  async function * gc () {
    const start = Date.now()
    log('Creating set of marked blocks')

    const release = await gcLock.writeLock()

    try {
      // Mark all blocks that are being used
      const markedSet = await createMarkedSet({ pins, blockstore, root, loadCodec })
      // Get all blocks keys from the blockstore
      const blockKeys = blockstore.queryKeys({})

      // Delete blocks that are not being used
      yield * deleteUnmarkedBlocks({ blockstore }, markedSet, blockKeys)

      log(`Complete (${Date.now() - start}ms)`)
    } finally {
      release()
    }
  }

  return gc
}

/**
 * Get Set of CIDs of blocks to keep
 *
 * @param {object} config
 * @param {import('./pins').Pins} config.pins
 * @param {import('interface-blockstore').Blockstore} config.blockstore
 * @param {import('interface-datastore').Datastore} config.root
 * @param {loadCodec} config.loadCodec
 */
async function createMarkedSet ({ pins, blockstore, loadCodec, root }) {
  const mfsSource = (async function * () {
    let mh
    try {
      mh = await root.get(MFS_ROOT_KEY)
    } catch (err) {
      if (err.code === ERR_NOT_FOUND) {
        log('No blocks in MFS')
        return
      }

      throw err
    }

    const rootCid = CID.decode(mh)
    yield rootCid
    yield * walkDag(rootCid, blockstore, loadCodec)
  })()

  const pinsSource = merge(
    map(pins.recursiveKeys(), ({ cid }) => cid),
    pins.indirectKeys(),
    map(pins.directKeys(), ({ cid }) => cid),
    mfsSource
  )

  const output = new Set()

  for await (const cid of merge(pinsSource, mfsSource)) {
    output.add(base32.encode(cid.multihash.bytes))
  }

  return output
}

/**
 * Delete all blocks that are not marked as in use
 *
 * @param {object} arg
 * @param {Blockstore} arg.blockstore
 * @param {Set<string>} markedSet
 * @param {AsyncIterable<CID>} blockKeys
 */
async function * deleteUnmarkedBlocks ({ blockstore }, markedSet, blockKeys) {
  // Iterate through all blocks and find those that are not in the marked set
  // blockKeys yields { key: Key() }
  let blocksCount = 0
  let removedBlocksCount = 0

  /**
   * @param {CID} cid
   */
  const removeBlock = async (cid) => {
    return async function remove () {
      blocksCount++

      try {
        const b32 = base32.encode(cid.multihash.bytes)

        if (markedSet.has(b32)) {
          return null
        }

        try {
          await blockstore.delete(cid)
          removedBlocksCount++
        } catch (err) {
          return {
            err: new Error(`Could not delete block with CID ${cid}: ${err.message}`)
          }
        }

        return { cid }
      } catch (err) {
        const msg = `Could delete block with CID ${cid}`
        log(msg, err)
        return { err: new Error(msg + `: ${err.message}`) }
      }
    }
  }

  yield * pipe(
    parallelBatch(map(blockKeys, removeBlock), BLOCK_RM_CONCURRENCY),
    // filter nulls (blocks that were retained)
    source => filter(source, Boolean)
  )

  log(`Marked set has ${markedSet.size} unique blocks. Blockstore has ${blocksCount} blocks. ` +
  `Deleted ${removedBlocksCount} blocks.`)
}
