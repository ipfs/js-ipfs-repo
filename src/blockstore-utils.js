'use strict'

const { Key } = require('interface-datastore')
const CID = require('cids')
const multibase = require('multibase')
const errcode = require('err-code')

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

  return new Key('/' + multibase.encode('base32', cid.buffer).toString().slice(1).toUpperCase(), false)
}

/**
 * Transform a datastore Key instance to a CID
 *
 * @param {Key} key
 * @returns {CID}
 */
exports.keyToCid = key => {
  return new CID(multibase.decode('b' + key.toString().slice(1).toLowerCase()))
}
