import type { Datastore, Options as DatastoreOptions, Query } from 'interface-datastore'
import type { BigNumber } from 'bignumber.js'

import type CID from 'cids'

export type AwaitIterable<T> = Iterable<T> | AsyncIterable<T>
export type Await<T> = Promise<T> | T

export interface Options {
  /**
   * Controls automatic migrations of repository. (defaults: true)
   */
  autoMigrate?: boolean
  /**
   * Callback function to be notified of migration progress
   */
  onMigrationProgress?: (version: number, percentComplete: string, message: string) => void
  /**
   * What type of lock to use. Lock has to be acquired when opening.
   */
  lock?: Lock | 'fs' | 'memory'

  /**
   * Map for backends and implementation reference.
   * - `root` (defaults to `datastore-fs` in Node.js and `datastore-level` in the browser)
   * - `blocks` (defaults to `datastore-fs` in Node.js and `datastore-level` in the browser)
   * - `keys` (defaults to `datastore-fs` in Node.js and `datastore-level` in the browser)
   * - `datastore` (defaults to `datastore-level`)
   * - `pins` (defaults to `datastore-level`)
   */
  storageBackends?: Partial<Record<Backends, { new(...args: any[]): Datastore }>>

  storageBackendOptions?: Partial<Record<Backends, unknown>>
}

export type Backends = 'root' | 'blocks' | 'keys' | 'datastore' | 'pins'

export interface Lock {
  /**
   * Sets the lock if one does not already exist. If a lock already exists, should throw an error.
   */
  lock: (dir: string) => Promise<LockCloser>

  /**
   * Checks the existence of the lock.
   */
  locked: (dir: string) => Promise<boolean>
}

export interface LockCloser {
  close: () => Promise<void>
}

export interface Stat {
  repoPath: string
  storageMax: BigNumber
  version: number
  numObjects: BigNumber
  repoSize: BigNumber
}

export interface Block {
  cid: CID
  data: Uint8Array
}

export interface Blockstore {
  open: () => Promise<Void>
  /**
   * Query the store
   */
  query: (query: Query, options?: DatastoreOptions) => AsyncIterable<Block|CID>

  /**
   * Get a single block by CID
   */
  get: (cid: CID, options?: DatastoreOptions) => Promise<Block>

  /**
   * Like get, but for more
   */
  getMany: (cids: AwaitIterable<CID>, options?: DatastoreOptions) => AsyncIterable<Block>

  /**
   * Write a single block to the store
   */
  put: (block: Block, options?: DatastoreOptions) => Promise<Block>

  /**
   * Like put, but for more
   */
  putMany: (blocks: AwaitIterable<Block>, options?: DatastoreOptions) => AsyncIterable<Block>

  /**
   * Does the store contain block with this CID?
   */
  has: (cid: CID, options?: DatastoreOptions) => Promise<boolean>

  /**
   * Delete a block from the store
   */
  delete: (cid: CID, options?: DatastoreOptions) => Promise<Void>

  /**
   * Delete a block from the store
   */
  deleteMany: (cids: AwaitIterable<any>, options?: DatastoreOptions) => AsyncIterable<Key>

  /**
   * Close the store
   */
  close: () => Promise<Void>
}