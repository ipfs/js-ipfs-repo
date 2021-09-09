'use strict'

const { Key } = require('interface-datastore')
const { base32 } = require('multiformats/bases/base32')
const { CID } = require('multiformats')

const PIN_DS_KEY = new Key('/local/pins')
const DEFAULT_FANOUT = 256
const MAX_ITEMS = 8192
const EMPTY_KEY = CID.parse('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')

const PinTypes = {
  direct: 'direct',
  recursive: 'recursive'
}

/**
 * @param {import('multiformats').CID} cid
 */
function cidToKey (cid) {
  return new Key(`/${base32.encode(cid.multihash.bytes).toUpperCase().substring(1)}`)
}

module.exports = {
  PIN_DS_KEY,
  DEFAULT_FANOUT,
  MAX_ITEMS,
  EMPTY_KEY,
  PinTypes,
  cidToKey
}
