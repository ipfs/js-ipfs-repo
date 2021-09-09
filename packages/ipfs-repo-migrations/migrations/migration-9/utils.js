
import { Key } from 'interface-datastore/key'
import { base32 } from 'multiformats/bases/base32'
import { CID } from 'multiformats/cid'

export const PIN_DS_KEY = new Key('/local/pins')
export const DEFAULT_FANOUT = 256
export const MAX_ITEMS = 8192
export const EMPTY_KEY = CID.parse('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')

export const PinTypes = {
  direct: 'direct',
  recursive: 'recursive'
}

/**
 * @param {import('multiformats').CID} cid
 */
 export function cidToKey (cid) {
  return new Key(`/${base32.encode(cid.multihash.bytes).toUpperCase().substring(1)}`)
}
