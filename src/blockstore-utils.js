'use strict'

const { Key } = require('interface-datastore')
const CID = require('cids')
const multibase = require('multibase')
const errcode = require('err-code')
const uint8ArrayToString = require('uint8arrays/to-string')

/**
 * Transform a cid to the appropriate datastore key.
 *
 * @param {CID} cid
 * @returns {Key}
 */
exports.cidToKey = cid => {
  if (!CID.isCID(cid)) {
    throw errcode(new Error('Not a valid cid'), 'ERR_INVALID_CID')
  }

  return new Key('/' + uint8ArrayToString(multibase.encode('base32', cid.multihash)).slice(1).toUpperCase(), false)
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
  return new CID(1, 'raw', multibase.decode('b' + key.toString().slice(1).toLowerCase()))
}
