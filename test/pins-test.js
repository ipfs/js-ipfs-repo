/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const dagPb = require('@ipld/dag-pb')
const dagCbor = require('@ipld/dag-cbor')
const { sha256 } = require('multiformats/hashes/sha2')
const { CID } = require('multiformats/cid')
const all = require('it-all')
const {
  PinTypes
} = require('../src/pins')
const uint8ArrayFromString = require('uint8arrays/from-string')

/**
 * @param {import('@ipld/dag-pb').PBNode} node
 */
async function createDagPbNode (node = { Data: uint8ArrayFromString(`data-${Math.random()}`), Links: [] }) {
  const buf = dagPb.encode(node)
  const hash = await sha256.digest(buf)
  const cid = CID.createV0(hash)

  return {
    cid,
    buf,
    node
  }
}

/**
 * @param {any} node
 */
async function createDagCborNode (node = { Data: uint8ArrayFromString(`data-${Math.random()}`), Links: [] }) {
  const buf = dagCbor.encode(node)
  const hash = await sha256.digest(buf)
  const cid = CID.createV1(dagCbor.code, hash)

  return {
    cid,
    buf,
    node
  }
}

/**
 * @param {import('../src/types').IPFSRepo} repo
 */
module.exports = (repo) => {
  describe('pins', () => {
    it('exists', () => {
      expect(repo).to.have.property('pins')
    })

    describe('.pinDirectly', () => {
      it('pins a block directly', async () => {
        const { cid, buf } = await createDagPbNode()

        await repo.blocks.put(cid, buf)
        await repo.pins.pinDirectly(cid)

        const pins = await all(repo.pins.directKeys())

        expect(pins.map(p => p.cid.toString())).to.include(cid.toString())
      })

      it('pins a block directly with metadata', async () => {
        const { cid, buf } = await createDagPbNode()

        const metadata = {
          foo: 'bar'
        }

        await repo.blocks.put(cid, buf)
        await repo.pins.pinDirectly(cid, { metadata })

        const pins = await all(repo.pins.directKeys())

        expect(pins.filter(p => p.cid.toString() === cid.toString()))
          .to.have.deep.nested.property('[0].metadata', metadata)
      })
    })

    describe('.pinRecursively', () => {
      it('pins a block recursively', async () => {
        const { cid, buf } = await createDagPbNode()

        await repo.blocks.put(cid, buf)
        await repo.pins.pinRecursively(cid)

        const pins = await all(repo.pins.recursiveKeys())

        expect(pins.map(p => p.cid.toString())).to.include(cid.toString())
      })

      it('pins a block recursively with metadata', async () => {
        const { cid, buf } = await createDagPbNode()

        const metadata = {
          foo: 'bar'
        }

        await repo.blocks.put(cid, buf)
        await repo.pins.pinRecursively(cid, { metadata })

        const pins = await all(repo.pins.recursiveKeys())

        expect(pins.filter(p => p.cid.toString() === cid.toString()))
          .to.have.deep.nested.property('[0].metadata', metadata)
      })
    })

    describe('.unpin', () => {
      it('unpins directly', async () => {
        const { cid, buf } = await createDagPbNode()

        await repo.blocks.put(cid, buf)
        await repo.pins.pinDirectly(cid)

        await expect(repo.pins.isPinnedWithType(cid, PinTypes.direct)).to.eventually.have.property('pinned', true)

        await repo.pins.unpin(cid)

        await expect(repo.pins.isPinnedWithType(cid, PinTypes.direct)).to.eventually.have.property('pinned', false)
      })

      it('unpins recursively', async () => {
        const { cid, buf } = await createDagPbNode()

        await repo.blocks.put(cid, buf)
        await repo.pins.pinRecursively(cid)

        await expect(repo.pins.isPinnedWithType(cid, PinTypes.recursive)).to.eventually.have.property('pinned', true)

        await repo.pins.unpin(cid)

        await expect(repo.pins.isPinnedWithType(cid, PinTypes.recursive)).to.eventually.have.property('pinned', false)
      })
    })

    describe('.indirectKeys', () => {
      it('lists indirectly pinned keys', async () => {
        const child = await createDagPbNode()
        const parent = await createDagPbNode({
          Links: [{
            Name: 'child',
            Tsize: child.buf.length,
            Hash: child.cid
          }]
        })

        await repo.blocks.put(child.cid, child.buf)
        await repo.blocks.put(parent.cid, parent.buf)
        await repo.pins.pinRecursively(parent.cid)

        const pins = await all(repo.pins.indirectKeys())

        expect(pins.map(c => c.toString())).to.include(child.cid.toString())
      })

      it('lists indirectly pinned cbor keys', async () => {
        const child = await createDagCborNode()
        const parent = await createDagCborNode({
          child: { '/': child.cid }
        })

        await repo.blocks.put(child.cid, child.buf)
        await repo.blocks.put(parent.cid, parent.buf)
        await repo.pins.pinRecursively(parent.cid)

        const pins = await all(repo.pins.indirectKeys())

        expect(pins.map(c => c.toString())).to.include(child.cid.toString())
      })
    })

    describe('.isPinnedWithType', () => {
      it('reports directly pinned blocks', async () => {
        const { cid, buf } = await createDagPbNode()

        await repo.blocks.put(cid, buf)

        await expect(repo.pins.isPinnedWithType(cid, PinTypes.direct)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.recursive)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.indirect)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.all)).to.eventually.have.property('pinned', false)

        await repo.pins.pinDirectly(cid)

        await expect(repo.pins.isPinnedWithType(cid, PinTypes.direct)).to.eventually.have.property('pinned', true)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.recursive)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.indirect)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.all)).to.eventually.have.property('pinned', true)
      })

      it('reports recursively pinned blocks', async () => {
        const { cid, buf } = await createDagPbNode()

        await repo.blocks.put(cid, buf)

        await expect(repo.pins.isPinnedWithType(cid, PinTypes.direct)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.recursive)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.indirect)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.all)).to.eventually.have.property('pinned', false)

        await repo.pins.pinRecursively(cid)

        await expect(repo.pins.isPinnedWithType(cid, PinTypes.direct)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.recursive)).to.eventually.have.property('pinned', true)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.indirect)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(cid, PinTypes.all)).to.eventually.have.property('pinned', true)
      })

      it('reports indirectly pinned blocks', async () => {
        const child = await createDagPbNode()
        const parent = await createDagPbNode({
          Links: [{
            Name: 'child',
            Tsize: child.buf.length,
            Hash: child.cid
          }]
        })

        await repo.blocks.put(child.cid, child.buf)
        await repo.blocks.put(parent.cid, parent.buf)

        await expect(repo.pins.isPinnedWithType(child.cid, PinTypes.direct)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(child.cid, PinTypes.recursive)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(child.cid, PinTypes.indirect)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(child.cid, PinTypes.all)).to.eventually.have.property('pinned', false)

        await repo.pins.pinRecursively(parent.cid)

        await expect(repo.pins.isPinnedWithType(child.cid, PinTypes.direct)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(child.cid, PinTypes.recursive)).to.eventually.have.property('pinned', false)
        await expect(repo.pins.isPinnedWithType(child.cid, PinTypes.indirect)).to.eventually.have.property('pinned', true)
        await expect(repo.pins.isPinnedWithType(child.cid, PinTypes.all)).to.eventually.have.property('pinned', true)
      })
    })
  })
}
