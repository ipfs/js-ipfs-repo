/* eslint-env mocha */
'use strict'

const dagPb = require('@ipld/dag-pb')
const dagCbor = require('@ipld/dag-cbor')

/**
 * @typedef {import('multiformats/codecs/interface').BlockCodec<any, any>} BlockCodec
 */

/**
 * @type {import('../../src/types').loadCodec}
 */
const loadCodec = (codeOrName) => {
  /** @type {Record<string | number, BlockCodec>} */
  const lookup = {
    [dagPb.code]: dagPb,
    [dagPb.name]: dagPb,
    [dagCbor.code]: dagCbor,
    [dagCbor.name]: dagCbor
  }

  return Promise.resolve(lookup[codeOrName])
}

module.exports = loadCodec
