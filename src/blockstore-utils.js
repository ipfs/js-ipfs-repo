'use strict'

const base32 = require('base32.js')
const { Key } = require('interface-datastore')
const CID = require('cids')

/**
 * Transform a cid to the appropriate datastore key.
 *
 * @param {CID} cid
 * @returns {Key}
 */
exports.cidToKey = cid => {
  const enc = new base32.Encoder()
  return new Key('/' + enc.write(cid.buffer).finalize(), false)
}

/**
 * Transform a datastore Key instance to a CID
 *
 * @param {Key} key
 * @returns {CID}
 */
exports.keyToCid = key => {
  // Block key is of the form /<base32 encoded string>
  const decoder = new base32.Decoder()
  const buff = decoder.write(key.toString().slice(1)).finalize()
  return new CID(Buffer.from(buff))
}
