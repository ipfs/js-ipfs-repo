'use strict'

const { Key } = require('interface-datastore')
const { CID } = require('multiformats')
const mhd = require('multiformats/hashes/digest')
const raw = require('multiformats/codecs/raw')
const errcode = require('err-code')
const { base32 } = require('multiformats/bases/base32')

/**
 * Transform a cid to the appropriate datastore key.
 *
 * @param {CID} c
 * @returns {Key}
 */
exports.cidToKey = c => {
  const cid = CID.asCID(c)

  if (cid == null) {
    throw errcode(new Error('Not a valid cid'), 'ERR_INVALID_CID')
  }

  const encoded = base32.encode(cid.multihash.bytes)

  return new Key('/' + encoded.slice(1).toUpperCase(), false)
}

/**
 * Transform a datastore Key instance to a CID
 * As Key is a multihash of the CID, it is reconstructed using IPLD's RAW codec.
 * Hence it is highly probable that stored CID will differ from a CID retrieved from blockstore.
 *
 * @param {Key} key
 * @returns {CID}
 */
exports.keyToCid = key => {
  // Block key is of the form /<base32 encoded string>
  const digest = mhd.decode(base32.decode('b' + key.toString().slice(1).toLowerCase()))

  return CID.createV1(raw.code, digest)
}
