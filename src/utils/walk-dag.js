'use strict'

const { CID } = require('multiformats/cid')
const cborg = require('cborg')
const dagPb = require('@ipld/dag-pb')
const dagCbor = require('@ipld/dag-cbor')
const log = require('debug')('ipfs:repo:utils:walk-dag')

/**
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
    const block = await blockstore.get(cid, options)
    const codec = await loadCodec(cid.code)
    const node = codec.decode(block)

    if (cid.code === dagPb.code) {
      for (const link of node.Links) {
        yield link.Hash
        yield * walkDag(link.Hash, blockstore, loadCodec, options)
      }
    } else if (cid.code === dagCbor.code) {
      for (const [, childCid] of dagCborLinks(node)) {
        yield childCid
        yield * walkDag(childCid, blockstore, loadCodec, options)
      }
    }
  } catch (err) {
    log('Could not walk DAG for CID', cid.toString(), err)
  }
}

// eslint-disable-next-line jsdoc/require-returns-check
/**
 * @param {any} obj
 * @param {string[]} path
 * @param {boolean} parseBuffer
 * @returns {Generator<[string, CID], void, undefined>}
 */
function * dagCborLinks (obj, path = [], parseBuffer = true) {
  if (parseBuffer && Buffer.isBuffer(obj)) {
    obj = cborg.decode(obj)
  }

  for (const key of Object.keys(obj)) {
    const _path = path.slice()
    _path.push(key)
    const val = obj[key]

    if (val && typeof val === 'object') {
      if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) {
          const __path = _path.slice()
          __path.push(i.toString())
          const o = val[i]
          if (CID.isCID(o)) { // eslint-disable-line max-depth
            yield [__path.join('/'), o]
          } else if (typeof o === 'object') {
            yield * dagCborLinks(o, _path, false)
          }
        }
      } else {
        if (CID.isCID(val)) {
          yield [_path.join('/'), val]
        } else {
          yield * dagCborLinks(val, _path, false)
        }
      }
    }
  }
}

module.exports = walkDag
