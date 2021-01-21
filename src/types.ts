import type { DatastoreFactory } from 'interface-datastore'
import type { BigNumber } from 'bignumber.js'
import type Repo from './index'
import type { Datastore } from 'interface-datastore/dist/src/types'

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
  onMigrationProgress?: (version: number, percentComplete: number, message: string) => void
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
  storageBackends?: Record<Backends, DatastoreFactory>

  storageBackendOptions?: Record<Partial<Backends>, unknown>
}

/**
 * Internal options where we know that lock and storage are not undefined
 */
export interface InternalOptions {
  /**
   * Controls automatic migrations of repository. (defaults: true)
   */
  autoMigrate?: boolean
  /**
   * Callback function to be notified of migration progress
   */
  onMigrationProgress?: (version: number, percentComplete: number, message: string) => void
  /**
   * What type of lock to use. Lock has to be acquired when opening.
   */
  lock: Lock | 'fs' | 'memory'

  /**
   * Map for backends and implementation reference.
   * - `root` (defaults to `datastore-fs` in Node.js and `datastore-level` in the browser)
   * - `blocks` (defaults to `datastore-fs` in Node.js and `datastore-level` in the browser)
   * - `keys` (defaults to `datastore-fs` in Node.js and `datastore-level` in the browser)
   * - `datastore` (defaults to `datastore-level`)
   * - `pins` (defaults to `datastore-level`)
   */
  storageBackends: Record<Backends, DatastoreFactory>

  storageBackendOptions: Record<Partial<Backends>, unknown>
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
