
import type { Datastore, Options as DatastoreOptions, Query, KeyQuery, Key } from 'interface-datastore'
import type CID from 'cids'
import type Block from 'ipld-block'

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
  storageMax: BigInt
  version: number
  numObjects: BigInt
  repoSize: BigInt
}

export interface Blockstore {
  open: () => Promise<void>

  /**
   * Query the store
   */
  query: (query: Query, options?: DatastoreOptions) => AsyncIterable<Block>

  /**
   * Query the store, returning only keys
   */
   queryKeys: (query: KeyQuery, options?: DatastoreOptions) => AsyncIterable<CID>

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
  delete: (cid: CID, options?: DatastoreOptions) => Promise<void>

  /**
   * Delete a block from the store
   */
  deleteMany: (cids: AwaitIterable<any>, options?: DatastoreOptions) => AsyncIterable<Key>

  /**
   * Close the store
   */
  close: () => Promise<void>
}

export interface Config {
  Addresses?: AddressConfig
  API?: APIConfig,
  Profiles?: string
  Bootstrap?: string[]
  Discovery?: DiscoveryConfig
  Datastore?: DatastoreConfig
  Identity?: IdentityConfig
  Keychain?: KeychainConfig
  Pubsub?: PubsubConfig
  Swarm?: SwarmConfig
  Routing?: RoutingConfig
}

/**
 * Contains information about various listener addresses to be used by this node
 */
export interface AddressConfig {
  API?: string
  RPC?: string
  Delegates?: string[]
  Gateway?: string
  Swarm?: string[],
  Announce?: string[],
  NoAnnounce?: string[]
}

export interface APIConfig {
  HTTPHeaders?: Record<string, string[]>
}

export interface DiscoveryConfig {
  MDNS?: MDNSDiscovery
  webRTCStar?: WebRTCStarDiscovery
}

export interface MDNSDiscovery {
  Enabled?: boolean
  Interval?: number
}

export interface WebRTCStarDiscovery {
  Enabled?: boolean
}

export interface DatastoreConfig {
  Spec?: DatastoreSpec
}

export interface DatastoreType {
  type: string,
  path: string,
  sync?: boolean,
  shardFunc?: string,
  compression?: string
}

export interface DatastoreMountPoint {
  mountpoint: string,
  type: string,
  prefix: string,
  child: DatastoreType
}

export interface DatastoreSpec {
  type?: string,
  mounts?: DatastoreMountPoint[]
}

export interface IdentityConfig {
  /**
   * The unique PKI identity label for this configs peer. Set on init and never
   * read, its merely here for convenience. IPFS will always generate the peerID
   * from its keypair at runtime.
   */
  PeerID: string

  /**
   * The base64 encoded protobuf describing (and containing) the nodes private key.
   */
  PrivKey: string
}

export interface KeychainConfig {
  DEK?: DEK
}

export interface DEK {
  keyLength?: number
  iterationCount?: number
  salt?: string
  hash?: string
}

export interface PubsubConfig {
  PubSubRouter?: 'gossipsub' | 'floodsub'
  Enabled?: boolean
}

export interface SwarmConfig {
  ConnMgr?: ConnMgrConfig
  DisableNatPortMap?: boolean
}

export interface ConnMgrConfig {
  LowWater?: number
  HighWater?: number
}

export interface RoutingConfig {
  Type?: string
}
