import { expectType } from 'tsd'
import type { IPFSRepo } from '../'
import { createRepo } from '../'
import { MemoryDatastore } from 'interface-datastore'
import { MemoryBlockstore } from 'interface-blockstore'

expectType<IPFSRepo>(createRepo('', async () => ({
  name: '',
  code: 0,
  encode: () => new Uint8Array(),
  decode: () => {}
}), {
  root: new MemoryDatastore(),
  blocks: new MemoryBlockstore(),
  keys: new MemoryDatastore(),
  pins: new MemoryDatastore(),
  datastore: new MemoryDatastore()
}))
