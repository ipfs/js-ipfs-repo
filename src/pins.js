/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { CID } = require('multiformats/cid')
const errCode = require('err-code')
const debug = require('debug')
const first = require('it-first')
const Block = require('multiformats/block')
const cborg = require('cborg')
const dagPb = require('@ipld/dag-pb')
const {
  cidToKey,
  keyToMultihash
} = require('./utils/blockstore')
const walkDag = require('./utils/walk-dag')

/**
 * @typedef {object} PinInternal
 * @property {number} depth
 * @property {import('multiformats/cid').CIDVersion} [version]
 * @property {number} [codec]
 * @property {Record<string, any>} [metadata]
 */

/**
 * @typedef {import('./types').PinType} PinType
 * @typedef {import('./types').PinQueryType} PinQueryType
 * @typedef {import('multiformats/codecs/interface').BlockCodec<any, any>} BlockCodec
 * @typedef {import('./types').PinOptions} PinOptions
 * @typedef {import('./types').AbortOptions} AbortOptions
 * @typedef {import('./types').Pins} Pins
 */

/**
 * @param {string} type
 */
function invalidPinTypeErr (type) {
  const errMsg = `Invalid type '${type}', must be one of {direct, indirect, recursive, all}`
  return errCode(new Error(errMsg), 'ERR_INVALID_PIN_TYPE')
}

const PinTypes = {
  /** @type {'direct'} */
  direct: ('direct'),
  /** @type {'recursive'} */
  recursive: ('recursive'),
  /** @type {'indirect'} */
  indirect: ('indirect'),
  /** @type {'all'} */
  all: ('all')
}

/**
 * @implements {Pins}
 */
class PinManager {
  /**
   * @param {Object} config
   * @param {import('interface-datastore').Datastore} config.pinstore
   * @param {import('interface-blockstore').Blockstore} config.blockstore
   * @param {import('./types').loadCodec} config.loadCodec
   */
  constructor ({ pinstore, blockstore, loadCodec }) {
    this.pinstore = pinstore
    this.blockstore = blockstore
    this.loadCodec = loadCodec
    this.log = debug('ipfs:repo:pin')
    this.directPins = new Set()
    this.recursivePins = new Set()
  }

  /**
   * @param {CID} cid
   * @param {PinOptions & AbortOptions} [options]
   */
  async pinDirectly (cid, options = {}) {
    await this.blockstore.get(cid, options)

    /** @type {PinInternal} */
    const pin = {
      depth: 0
    }

    if (cid.version !== 0) {
      pin.version = cid.version
    }

    if (cid.code !== dagPb.code) {
      pin.codec = cid.code
    }

    if (options.metadata) {
      pin.metadata = options.metadata
    }

    return this.pinstore.put(cidToKey(cid), cborg.encode(pin))
  }

  /**
   * @param {CID} cid
   * @param {AbortOptions} [options]
   */
  unpin (cid, options) {
    return this.pinstore.delete(cidToKey(cid), options)
  }

  /**
   * @param {CID} cid
   * @param {PinOptions & AbortOptions} [options]
   */
  async pinRecursively (cid, options = {}) {
    await this.fetchCompleteDag(cid, options)

    /** @type {PinInternal} */
    const pin = {
      depth: Infinity
    }

    if (cid.version !== 0) {
      pin.version = cid.version
    }

    if (cid.code !== dagPb.code) {
      pin.codec = cid.code
    }

    if (options.metadata) {
      pin.metadata = options.metadata
    }

    await this.pinstore.put(cidToKey(cid), cborg.encode(pin))
  }

  /**
   * @param {AbortOptions} [options]
   */
  async * directKeys (options) {
    for await (const entry of this.pinstore.query({
      filters: [(entry) => {
        const pin = cborg.decode(entry.value)

        return pin.depth === 0
      }]
    })) {
      const pin = cborg.decode(entry.value)
      const version = pin.version || 0
      const codec = pin.codec != null ? pin.codec : dagPb.code
      const multihash = keyToMultihash(entry.key)

      yield {
        cid: CID.create(version, codec, multihash),
        metadata: pin.metadata
      }
    }
  }

  /**
   * @param {AbortOptions} [options]
   */
  async * recursiveKeys (options) {
    for await (const entry of this.pinstore.query({
      filters: [(entry) => {
        const pin = cborg.decode(entry.value)

        return pin.depth === Infinity
      }]
    })) {
      const pin = cborg.decode(entry.value)
      const version = pin.version || 0
      const codec = pin.codec != null ? pin.codec : dagPb.code
      const multihash = keyToMultihash(entry.key)

      yield {
        cid: CID.create(version, codec, multihash),
        metadata: pin.metadata
      }
    }
  }

  /**
   * @param {AbortOptions} [options]
   */
  async * indirectKeys (options) {
    for await (const { cid } of this.recursiveKeys()) {
      for await (const childCid of walkDag(cid, this.blockstore, this.loadCodec, options)) {
        // recursive pins override indirect pins
        const types = [
          PinTypes.recursive
        ]

        const result = await this.isPinnedWithType(childCid, types)

        if (result.pinned) {
          continue
        }

        yield childCid
      }
    }
  }

  /**
   * @param {CID} cid
   * @param {PinQueryType|PinQueryType[]} types
   * @param {AbortOptions} [options]
   */
  async isPinnedWithType (cid, types, options) {
    if (!Array.isArray(types)) {
      types = [types]
    }

    const all = types.includes(PinTypes.all)
    const direct = types.includes(PinTypes.direct)
    const recursive = types.includes(PinTypes.recursive)
    const indirect = types.includes(PinTypes.indirect)

    if (recursive || direct || all) {
      const result = await first(this.pinstore.query({
        prefix: cidToKey(cid).toString(),
        filters: [entry => {
          if (all) {
            return true
          }

          const pin = cborg.decode(entry.value)

          return types.includes(pin.depth === 0 ? PinTypes.direct : PinTypes.recursive)
        }],
        limit: 1
      }))

      if (result) {
        const pin = cborg.decode(result.value)

        return {
          cid,
          pinned: true,
          reason: pin.depth === 0 ? PinTypes.direct : PinTypes.recursive,
          metadata: pin.metadata
        }
      }
    }

    const self = this

    /**
     * @param {CID} key
     * @param {AsyncIterable<{ cid: CID, metadata: any }>} source
     */
    async function * findChild (key, source) {
      for await (const { cid: parentCid } of source) {
        for await (const childCid of walkDag(parentCid, self.blockstore, self.loadCodec)) {
          if (childCid.equals(key)) {
            yield parentCid
            return
          }
        }
      }
    }

    if (all || indirect) {
      // indirect (default)
      // check each recursive key to see if multihash is under it

      const parentCid = await first(findChild(cid, this.recursiveKeys()))

      if (parentCid) {
        return {
          cid,
          pinned: true,
          reason: PinTypes.indirect,
          parent: parentCid
        }
      }
    }

    return {
      cid,
      pinned: false
    }
  }

  /**
   * @param {CID} cid
   * @param {AbortOptions} options
   */
  async fetchCompleteDag (cid, options) {
    const seen = new Set()

    /**
     * @param {CID} cid
     * @param {AbortOptions} options
     */
    const walkDag = async (cid, options) => {
      if (seen.has(cid.toString())) {
        return
      }

      seen.add(cid.toString())

      const bytes = await this.blockstore.get(cid, options)
      const codec = await this.loadCodec(cid.code)
      const block = Block.createUnsafe({ bytes, cid, codec })

      await Promise.all(
        [...block.links()].map(([, childCid]) => walkDag(childCid, options))
      )
    }

    await walkDag(cid, options)
  }

  /**
   * Throws an error if the pin type is invalid
   *
   * @param {any} type
   * @returns {type is PinType}
   */
  static checkPinType (type) {
    if (typeof type !== 'string' || !Object.keys(PinTypes).includes(type)) {
      throw invalidPinTypeErr(type)
    }
    return true
  }
}

module.exports = {
  PinManager,
  PinTypes
}
