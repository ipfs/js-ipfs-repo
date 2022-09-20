/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/chai'
import * as dagPb from '@ipld/dag-pb'
import * as dagCbor from '@ipld/dag-cbor'
import { sha256 } from 'multiformats/hashes/sha2'
import { CID } from 'multiformats/cid'
import all from 'it-all'
import { PinTypes } from '../src/pin-types.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import Sinon from 'sinon'

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
export default (repo) => {
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

      it('does not traverse the same linked node twice', async () => {
        // @ts-expect-error blockstore property is private
        const getSpy = Sinon.spy(repo.pins.blockstore, 'get')

        const { cid: childCid, buf: childBuf } = await createDagPbNode()
        await repo.blocks.put(childCid, childBuf)

        // create a root block with duplicate links to the same block
        const { cid: rootCid, buf: rootBuf } = await createDagPbNode({
          Links: [{
            Name: 'child-1',
            Tsize: childBuf.byteLength,
            Hash: childCid
          }, {
            Name: 'child-2',
            Tsize: childBuf.byteLength,
            Hash: childCid
          }]
        })
        await repo.blocks.put(rootCid, rootBuf)

        await repo.pins.pinRecursively(rootCid)

        expect(getSpy.callCount).to.equal(2, 'should only have loaded the child block once')
        expect(getSpy.getCall(0).args[0]).to.deep.equal(rootCid)
        expect(getSpy.getCall(1).args[0]).to.deep.equal(childCid)
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
        const child = await createDagCborNode({
          data: Math.random()
        })
        const parent = await createDagCborNode({
          child: child.cid,
          data: Math.random()
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
