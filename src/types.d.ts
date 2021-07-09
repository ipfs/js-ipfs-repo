
import type { Datastore } from 'interface-datastore'
import type { Blockstore } from 'interface-blockstore'
import type { CID } from 'multiformats/cid'
import type { BlockCodec } from 'multiformats/codecs/interface'

export type AwaitIterable<T> = Iterable<T> | AsyncIterable<T>
export type Await<T> = Promise<T> | T

export interface Options {
  /**
   * Controls automatic migrations of repository. (defaults: true)
   */
  autoMigrate: boolean
  /**
   * Callback function to be notified of migration progress
   */
  onMigrationProgress: (version: number, percentComplete: string, message: string) => void

  /**
   * If multiple processes are accessing the same repo - e.g. via node cluster or browser UI and webworkers
   * one instance must be designated the repo owner to hold the lock on shared resources like the datastore.
   *
   * Set this property to true on one instance only if this is how your application is set up.
   */
  repoOwner: boolean

  /**
   * A lock implementation that prevents multiple processes accessing the same repo
   */
  repoLock: RepoLock
}

export interface IPFSRepo {
  closed: boolean
  path: string
  root: Datastore
  datastore: Datastore
  keys: Datastore
  pins: Pins
  blocks: Blockstore

  version: {
    exists: () => Promise<any>
    get: () => Promise<number>
    set: (version: number) => Promise<void>
    check: (expected: number) => Promise<boolean>
  }

  config: {
    getAll: (options?: {
      signal?: AbortSignal
    }) => Promise<import('./types').Config>
    get: (key: string, options?: {
      signal?: AbortSignal
    }) => Promise<any>
    set: (key: string, value?: any, options?: {
      signal?: AbortSignal
    }) => Promise<void>
    replace: (value?: import('./types').Config, options?: {
      signal?: AbortSignal
    }) => Promise<void>
    exists: () => Promise<any>
  }

  spec: {
    exists: () => Promise<boolean>
    get: () => Promise<Uint8Array>
    set: (spec: any) => Promise<void>
  }

  apiAddr: {
    get: () => Promise<string>
    set: (value: string) => Promise<void>
    delete: () => Promise<void>
  }

  gcLock: GCLock

  gc: () => AsyncGenerator<GCErrorResult | GCSuccessResult, void, unknown>

  /**
   * Initialize a new repo.
   *
   * @param {import('./types').Config} config - config to write into `config`.
   * @returns {Promise<void>}
   */
  init: (config: Config) => Promise<void>

  /**
   * Check if the repo is already initialized.
   *
   * @returns {Promise<boolean>}
   */
  isInitialized: () => Promise<boolean>

  /**
   * Open the repo. If the repo is already open an error will be thrown.
   * If the repo is not initialized it will throw an error.
   *
   * @returns {Promise<void>}
   */
  open: () => Promise<void>

  /**
   * Close the repo and cleanup.
   *
   * @returns {Promise<void>}
   */
  close: () => Promise<void>

  /**
   * Check if a repo exists.
   *
   * @returns {Promise<boolean>}
   */
  exists: () => Promise<boolean>

  /**
   * Get repo status.
   *
   * @returns {Promise<Stat>}
   */
  stat: () => Promise<Stat>
}

export interface Backends {
  root: Datastore
  blocks: Blockstore
  keys: Datastore
  datastore: Datastore
  pins: Datastore
}

export interface LockCloser {
  close: () => Promise<void>
}

export interface RepoLock {
  /**
   * Sets the lock if one does not already exist. If a lock already exists, should throw an error.
   */
  lock: (path: string) => Promise<LockCloser>

  /**
   * Checks the existence of the lock.
   */
  locked: (path: string) => Promise<boolean>
}

export interface ReleaseLock { (): void }

export interface GCLock {
  readLock: () => Promise<ReleaseLock>
  writeLock: () => Promise<ReleaseLock>
}

export interface GCErrorResult {
  err: Error
  cid?: undefined
}

export interface GCSuccessResult {
  cid: CID
  err?: undefined
}

export interface Stat {
  repoPath: string
  storageMax: BigInt
  version: number
  numObjects: BigInt
  repoSize: BigInt
}

export interface Config {
  Addresses?: AddressConfig
  API?: APIConfig
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
  Swarm?: string[]
  Announce?: string[]
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
  type: string
  path: string
  sync?: boolean
  shardFunc?: string
  compression?: string
}

export interface DatastoreMountPoint {
  mountpoint: string
  type: string
  prefix: string
  child: DatastoreType
}

export interface DatastoreSpec {
  type?: string
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

export type PinType = 'recursive' | 'direct' | 'indirect' | 'all'

export type PinQueryType = 'recursive' | 'direct' | 'indirect' | 'all'

export interface PinOptions extends AbortOptions {
  metadata?: Record<string, any>
}

export interface Pin {
  cid: CID
  metadata?: Record<string, any>
}

export interface PinnedWithTypeResult {
  cid: CID
  pinned: boolean
  reason?: PinType
  metadata?: Record<string, any>
  parent?: CID
}

export interface Pins {
  pinDirectly: (cid: CID, options?: PinOptions) => Promise<void>
  pinRecursively: (cid: CID, options?: PinOptions) => Promise<void>
  unpin: (cid: CID, options?: AbortOptions) => Promise<void>
  directKeys: (options?: AbortOptions) => AsyncGenerator<Pin, void, undefined>
  recursiveKeys: (options?: AbortOptions) => AsyncGenerator<Pin, void, undefined>
  indirectKeys: (options?: AbortOptions) => AsyncGenerator<CID, void, undefined>
  isPinnedWithType: (cid: CID, types: PinQueryType|PinQueryType[], options?: AbortOptions) => Promise<PinnedWithTypeResult>
}

export interface AbortOptions {
  signal?: AbortSignal
}

export interface loadCodec { (codeOrName: number | string): Promise<BlockCodec<any, any>> }
