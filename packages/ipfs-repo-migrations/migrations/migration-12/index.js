import $protobuf from "protobufjs/minimal.js"

// @ts-expect-error Explicitly disable long.js support
$protobuf.util.Long = undefined
$protobuf.configure()

import { Key } from 'interface-datastore/key'
import { Protocols } from './pb/proto-book.js'
import { Addresses } from './pb/address-book.js'
import { Peer } from './pb/peer.js'
import { Envelope } from './pb/envelope.js'
import { PeerRecord } from './pb/peer-record.js'
import { multiaddr } from '@multiformats/multiaddr'

/**
 * @param {import('../../src/types').Backends} backends
 * @param {import('../../src/types').MigrationProgressCallback} onProgress
 */
async function storePeerUnderSingleDatastoreKey (backends, onProgress = () => {}) {
  onProgress(0, 'Storing each peerstore key under a single datastore key')

  await backends.datastore.open()

  /** @type {Record<string, any>} */
  const peers = {}
  /** @type {Key[]} */
  const keys = []

  for await (const { key, value } of backends.datastore.query({
    prefix: '/peers'
  })) {
    keys.push(key)
    const keyStr = key.toString()
    const [_, prefix, type, peerId, metadataKey] = keyStr.split('/')

    if (prefix !== 'peers') {
      continue
    }

    if (!['protos', 'addrs', 'metadata', 'keys'].includes(type)) {
      continue
    }

    if (!peerId) {
      continue
    }

    peers[peerId] = peers[peerId] || {
      addresses: [],
      protocols: [],
      metadata: []
    }

    if (type === 'protos') {
      const protos = Protocols.decode(value)

      peers[peerId].protocols = protos.protocols.sort()
    } else if (type === 'addrs') {
      const addrs = Addresses.decode(value)

      peers[peerId].addresses = addrs.addrs.sort((a, b) => {
        return multiaddr(a.multiaddr).toString().localeCompare(multiaddr(b.multiaddr).toString())
      })

      if (addrs.certifiedRecord && addrs.certifiedRecord.raw) {
        peers[peerId].peerRecordEnvelope = addrs.certifiedRecord.raw
      }
    } else if (type === 'metadata') {
      peers[peerId].metadata.push({ key: metadataKey, value })
    } else if (type === 'keys') {
      peers[peerId].pubKey = value
    }
  }

  onProgress(33, 'Read peer data from store')

  for (const key of keys) {
    await backends.datastore.delete(key)
  }

  onProgress(66, 'Removed existing peer data from store')

  for (const peerId of Object.keys(peers)) {
    const peer = peers[peerId]
    peer.metadata = peer.metadata.sort((/** @type {{ key: string }} */ a, /** @type {{ key: string }} */ b) => a.key.localeCompare(b.key))

    const data = Peer.encode(peer).finish()

    await backends.datastore.put(new Key(`/peers/${peerId}`), data)
  }

  await backends.datastore.close()

  onProgress(100, 'Stored each peerstore key under a single datastore key')
}

/**
 * @param {import('../../src/types').Backends} backends
 * @param {import('../../src/types').MigrationProgressCallback} onProgress
 */
async function storePeerUnderMultipleDatastoreKeys (backends, onProgress = () => {}) {
  onProgress(0, 'Storing each peerstore key under a multiple datastore keys')

  await backends.datastore.open()

  /** @type {Record<string, any>} */
  const peers = {}
  /** @type {Key[]} */
  const keys = []

  for await (const { key, value } of backends.datastore.query({
    prefix: '/peers'
  })) {
    keys.push(key)
    const keyStr = key.toString()

    const [_, _prefix, peerId] = keyStr.split('/')

    peers[peerId] = Peer.decode(value)
  }

  onProgress(33, 'Read peer data from store')

  for (const key of keys) {
    await backends.datastore.delete(key)
  }

  onProgress(66, 'Removed existing peer data from store')

  for (const [peerId, peer] of Object.entries(peers)) {
    if (peer.protocols && peer.protocols.length > 0) {
      await backends.datastore.put(new Key(`/peers/protos/${peerId}`), Protocols.encode({
        protocols: peer.protocols
      }).finish())
    }

    if (peer.addresses && peer.addresses.length > 0) {
      const peerRecordEnvelope = peer.peerRecordEnvelope
      let certifiedRecord

      if (peerRecordEnvelope) {
        const envelope = Envelope.decode(peerRecordEnvelope)
        const record = PeerRecord.decode(envelope.payload)

        certifiedRecord = {
          raw: peerRecordEnvelope,
          seq: record.seq
        }
      }

      await backends.datastore.put(new Key(`/peers/addrs/${peerId}`), Addresses.encode({
        addrs: peer.addresses,
        certifiedRecord
      }).finish())
    }

    if (peer.metadata && peer.metadata.length > 0) {
      for (const { key, value } of peer.metadata) {
        await backends.datastore.put(new Key(`/peers/metadata/${peerId}/${key}`), value)
      }
    }

    if (peer.pubKey) {
      await backends.datastore.put(new Key(`/peers/keys/${peerId}`), peer.pubKey)
    }
  }

  await backends.datastore.close()

  onProgress(100, 'Stored each peerstore key under multiple datastore keys')
}

/** @type {import('../../src/types').Migration} */
export const migration = {
  version: 12,
  description: 'Store each peerstore peer under a single datastore key',
  migrate: storePeerUnderSingleDatastoreKey,
  revert: storePeerUnderMultipleDatastoreKeys
}
