
import { CID } from 'multiformats/cid'
import { ipfs } from './pin.js'
// @ts-ignore
import fnv1a from 'fnv1a'
import varint from 'varint'
import * as dagPb from '@ipld/dag-pb'
import { DEFAULT_FANOUT, MAX_ITEMS, EMPTY_KEY } from './utils.js'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { compare as uint8ArrayCompare } from 'uint8arrays/compare'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { sha256 } from 'multiformats/hashes/sha2'

const PinSet = ipfs.pin.Set

/**
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 * @typedef {import('@ipld/dag-pb').PBNode} PBNode
 *
 * @typedef {object} Pin
 * @property {CID} key
 * @property {Uint8Array} [data]
 */

/**
 * @param {PBNode} rootNode
 */
function readHeader (rootNode) {
  // rootNode.data should be a buffer of the format:
  // < varint(headerLength) | header | itemData... >
  const rootData = rootNode.Data

  if (!rootData) {
    throw new Error('No data present')
  }

  const hdrLength = varint.decode(rootData)
  const vBytes = varint.decode.bytes ?? 0

  if (vBytes <= 0) {
    throw new Error('Invalid Set header length')
  }

  if (vBytes + hdrLength > rootData.length) {
    throw new Error('Impossibly large set header length')
  }

  const hdrSlice = rootData.slice(vBytes, hdrLength + vBytes)
  const header = PinSet.toObject(PinSet.decode(hdrSlice), {
    defaults: false,
    arrays: true,
    longs: Number,
    objects: false
  })

  if (header.version !== 1) {
    throw new Error(`Unsupported Set version: ${header.version}`)
  }

  if (header.fanout > rootNode.Links.length) {
    throw new Error('Impossibly large fanout')
  }

  return {
    header: header,
    data: rootData.slice(hdrLength + vBytes)
  }
}

/**
 * @param {number} seed
 * @param {CID} key
 */
function hash (seed, key) {
  const buffer = new Uint8Array(4)
  const dataView = new DataView(buffer.buffer)
  dataView.setUint32(0, seed, true)
  const encodedKey = uint8ArrayFromString(key.toString())
  const data = uint8ArrayConcat([buffer, encodedKey], buffer.byteLength + encodedKey.byteLength)

  return fnv1a(uint8ArrayToString(data))
}

/**
 * @param {Blockstore} blockstore
 * @param {PBNode} node
 * @returns {AsyncGenerator<CID, void, undefined>}
 */
async function * walkItems (blockstore, node) {
  const pbh = readHeader(node)
  let idx = 0

  for (const link of node.Links) {
    if (idx < pbh.header.fanout) {
      // the first pbh.header.fanout links are fanout bins
      // if a fanout bin is not 'empty', dig into and walk its DAGLinks
      const linkHash = link.Hash

      if (!EMPTY_KEY.equals(linkHash)) {
        // walk the links of this fanout bin
        const buf = await blockstore.get(linkHash)
        const node = dagPb.decode(buf)

        yield * walkItems(blockstore, node)
      }
    } else {
      // otherwise, the link is a pin
      yield link.Hash
    }

    idx++
  }
}

/**
 * @param {Blockstore} blockstore
 * @param {PBNode} rootNode
 * @param {string} name
 */
export async function * loadSet (blockstore, rootNode, name) {
  const link = rootNode.Links.find(l => l.Name === name)

  if (!link) {
    throw new Error('No link found with name ' + name)
  }

  const buf = await blockstore.get(link.Hash)
  const node = dagPb.decode(buf)

  yield * walkItems(blockstore, node)
}

/**
 * @param {Blockstore} blockstore
 * @param {Pin[]} items
 */
function storeItems (blockstore, items) {
  return storePins(items, 0)

  /**
   * @param {Pin[]} pins
   * @param {number} depth
   */
  async function storePins (pins, depth) {
    const pbHeader = PinSet.encode({
      version: 1,
      fanout: DEFAULT_FANOUT,
      seed: depth
    }).finish()

    const header = varint.encode(pbHeader.length)
    const headerBuf = uint8ArrayConcat([header, pbHeader])
    const fanoutLinks = []

    for (let i = 0; i < DEFAULT_FANOUT; i++) {
      fanoutLinks.push({
        Name: '',
        Tsize: 1,
        Hash: EMPTY_KEY
      })
    }

    if (pins.length <= MAX_ITEMS) {
      const nodes = pins
        .map(item => {
          return ({
            link: {
              Name: '',
              Tsize: 1,
              Hash: item.key
            },
            data: item.data || new Uint8Array()
          })
        })
        // sorting makes any ordering of `pins` produce the same DAGNode
        .sort((a, b) => {
          return uint8ArrayCompare(a.link.Hash.bytes, b.link.Hash.bytes)
        })

      const rootLinks = fanoutLinks.concat(nodes.map(item => item.link))
      const rootData = uint8ArrayConcat([headerBuf, ...nodes.map(item => item.data)])

      return {
        Data: rootData,
        Links: rootLinks
      }
    } else {
      // If the array of pins is > MAX_ITEMS, we:
      //  - distribute the pins among `DEFAULT_FANOUT` bins
      //    - create a DAGNode for each bin
      //      - add each pin as a DAGLink to that bin
      //  - create a root DAGNode
      //    - add each bin as a DAGLink
      //  - send that root DAGNode via callback
      // (using go-ipfs' "wasteful but simple" approach for consistency)
      // https://github.com/ipfs/go-ipfs/blob/master/pin/set.go#L57

      /** @type {Pin[][]} */
      const bins = pins.reduce((bins, pin) => {
        const n = hash(depth, pin.key) % DEFAULT_FANOUT
        // @ts-ignore
        bins[n] = n in bins ? bins[n].concat([pin]) : [pin]
        return bins
      }, [])

      let idx = 0
      for (const bin of bins) {
        const child = await storePins(bin, depth + 1)

        await storeChild(child, idx)

        idx++
      }

      return {
        Data: headerBuf,
        Links: fanoutLinks
      }
    }

    /**
     * @param {PBNode} child
     * @param {number} binIdx
     */
    async function storeChild (child, binIdx) {
      const buf = dagPb.encode(child)
      const digest = await sha256.digest(buf)
      const cid = CID.createV0(digest)

      await blockstore.put(cid, buf)

      const size = child.Links.reduce((acc, curr) => acc + (curr.Tsize || 0), 0) + buf.length

      fanoutLinks[binIdx] = {
        Name: '',
        Tsize: size,
        Hash: cid
      }
    }
  }
}

/**
 * @param {Blockstore} blockstore
 * @param {string} type
 * @param {CID[]} cids
 */
export async function storeSet (blockstore, type, cids) {
  const rootNode = await storeItems(blockstore, cids.map(cid => {
    return {
      key: cid
    }
  }))
  const buf = dagPb.encode(rootNode)
  const digest = await sha256.digest(buf)
  const cid = CID.createV0(digest)

  await blockstore.put(cid, buf)

  const size = rootNode.Links.reduce((acc, curr) => acc + curr.Tsize, 0) + buf.length

  return {
    Name: type,
    Tsize: size,
    Hash: cid
  }
}
