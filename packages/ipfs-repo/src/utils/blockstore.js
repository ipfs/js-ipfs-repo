import { Key } from 'interface-datastore/key'
import { CID } from 'multiformats'
import * as raw from 'multiformats/codecs/raw'
import errCode from 'err-code'
import { base32 } from 'multiformats/bases/base32'
import * as Digest from 'multiformats/hashes/digest'

/**
 * Transform a cid to the appropriate datastore key.
 *
 * @param {CID} c
 */
export function cidToKey (c) {
  const cid = CID.asCID(c)

  if (cid == null) {
    throw errCode(new Error('Not a valid cid'), 'ERR_INVALID_CID')
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
 */
export function keyToCid (key) {
  // Block key is of the form /<base32 encoded string>
  return CID.createV1(raw.code, keyToMultihash(key))
}

/**
 * @param {Key | string} key
 */
export function keyToMultihash (key) {
  return Digest.decode(base32.decode(`b${key.toString().toLowerCase().substring(1)}`))
}
