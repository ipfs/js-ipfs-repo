import * as dagPb from '@ipld/dag-pb'
import * as dagCbor from '@ipld/dag-cbor'

/**
 * @typedef {import('multiformats/codecs/interface').BlockCodec<any, any>} BlockCodec
 */

/**
 * @type {import('../../src/types').loadCodec}
 */
export function loadCodec (codeOrName) {
  /** @type {Record<string | number, BlockCodec>} */
  const lookup = {
    [dagPb.code]: dagPb,
    [dagPb.name]: dagPb,
    [dagCbor.code]: dagCbor,
    [dagCbor.name]: dagCbor
  }

  return Promise.resolve(lookup[codeOrName])
}
