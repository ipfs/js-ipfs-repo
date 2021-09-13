/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { CID } from 'multiformats/cid'
import range from 'just-range'
import tempDir from 'ipfs-utils/src/temp-dir.js'
import { createRepo } from '../src/index.js'
import drain from 'it-drain'
import all from 'it-all'
import first from 'it-first'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { BaseBlockstore } from 'blockstore-core/base'
import { sha256 } from 'multiformats/hashes/sha2'
import { identity } from 'multiformats/hashes/identity'
import * as raw from 'multiformats/codecs/raw'
import * as dagCbor from '@ipld/dag-cbor'
import * as dagPb from '@ipld/dag-pb'
import { loadCodec } from './fixtures/load-codec.js'
import { createBackend } from './fixtures/create-backend.js'
import { MemoryLock } from '../src/locks/memory.js'

async function makePair () {
  const data = new TextEncoder().encode(`hello-${Math.random()}`)
  const digest = await sha256.digest(data)
  const cid = CID.create(1, raw.code, digest)

  return { key: cid, value: data }
}

/**
 * @typedef {import('interface-datastore').Key} Key
 * @typedef {import('interface-blockstore').Pair} Pair
 * @typedef {import('../src/types').IPFSRepo} IPFSRepo
 */

/**
 *
 * @param {IPFSRepo} repo
 */
export default (repo) => {
  describe('blockstore', () => {
    const blockData = range(100).map((i) => uint8ArrayFromString(`hello-${i}-${Math.random()}`))
    const bData = uint8ArrayFromString('hello world')
    const identityData = uint8ArrayFromString('A16461736466190144', 'base16upper')

    /** @type { { key: CID, value: Uint8Array } } */
    let pair
    /** @type {CID} */
    let identityCID

    before(async () => {
      const digest1 = await sha256.digest(bData)
      pair = { key: CID.createV0(digest1), value: bData }
      const digest2 = await identity.digest(identityData)
      identityCID = CID.createV1(identity.code, digest2)
    })

    describe('.put', () => {
      /** @type {IPFSRepo} */
      let otherRepo

      after(async () => {
        if (otherRepo) {
          await otherRepo.close()
        }
      })

      it('simple', async () => {
        await repo.blocks.put(pair.key, pair.value)
      })

      it('does not write an identity block', async () => {
        await repo.blocks.put(identityCID, identityData)
        const cids = await all(repo.blocks.queryKeys({}))
        const rawCID = CID.createV1(raw.code, identityCID.multihash)
        expect(cids).to.not.deep.include(rawCID)
      })

      it('multi write (locks)', async () => {
        await Promise.all([repo.blocks.put(pair.key, pair.value), repo.blocks.put(pair.key, pair.value)])
      })

      it('empty value', async () => {
        const d = new Uint8Array(0)
        const digest = await sha256.digest(d)
        await repo.blocks.put(CID.createV0(digest), d)
      })

      it('massive multiwrite', async () => {
        const hashes = await Promise.all(range(100).map((i) => sha256.digest(blockData[i])))
        await Promise.all(range(100).map((i) => {
          return repo.blocks.put(CID.createV0(hashes[i]), blockData[i])
        }))
      })

      it('.putMany', async () => {
        const blocks = await Promise.all(range(50).map(async (i) => {
          const d = uint8ArrayFromString('many' + Math.random())
          const digest = await sha256.digest(d)
          return { key: CID.createV0(digest), value: d }
        }))

        const put = await all(repo.blocks.putMany(blocks))
        expect(put).to.deep.equal(blocks)

        for (const block of blocks) {
          const block1 = await repo.blocks.get(block.key)
          expect(block1).to.equalBytes(block.value)
        }
      })

      it('.putMany with identity block included', async function () {
        const d = uint8ArrayFromString('many' + Math.random())
        const digest = await sha256.digest(d)

        const blocks = [{
          key: CID.createV1(raw.code, digest), value: d
        }, {
          key: identityCID, value: identityData
        }]
        const put = await all(repo.blocks.putMany(blocks))
        expect(put).to.deep.equal(blocks)
        const cids = await all(repo.blocks.queryKeys({}))
        expect(cids).to.deep.include(CID.createV1(raw.code, digest))
        expect(cids).to.not.deep.include(CID.createV1(raw.code, identityCID.multihash))
      })

      it('returns an error on invalid block', () => {
        // @ts-expect-error
        return expect(repo.blocks.put('hello')).to.eventually.be.rejected()
      })
    })

    describe('.get', () => {
      /** @type {IPFSRepo} */
      let otherRepo

      after(async () => {
        if (otherRepo) {
          await otherRepo.close()
        }
      })

      it('simple', async () => {
        const block = await repo.blocks.get(pair.key)
        expect(block).to.equalBytes(pair.value)
      })

      it('massive read', async () => {
        await Promise.all(range(20 * 100).map(async (i) => {
          const j = i % blockData.length
          const digest = await sha256.digest(blockData[j])
          const cid = CID.createV0(digest)
          const block = await repo.blocks.get(cid)

          expect(block).to.equalBytes(blockData[j])
        }))
      })

      it('returns an error on invalid block', () => {
        // @ts-expect-error
        return expect(repo.blocks.get('woot')).to.eventually.be.rejected()
      })

      it('should get block stored under v0 CID with a v1 CID', async () => {
        const data = uint8ArrayFromString(`TEST${Math.random()}`)
        const digest = await sha256.digest(data)
        const cid = CID.createV0(digest)
        await repo.blocks.put(cid, data)
        const block = await repo.blocks.get(cid.toV1())
        expect(block).to.equalBytes(data)
      })

      it('should get block stored under v1 CID with a v0 CID', async () => {
        const data = uint8ArrayFromString(`TEST${Math.random()}`)

        const digest = await sha256.digest(data)
        const cid = CID.createV1(dagPb.code, digest)
        await repo.blocks.put(cid, data)
        const block = await repo.blocks.get(cid.toV0())
        expect(block).to.equalBytes(data)
      })

      it('throws when passed an invalid cid', () => {
        // @ts-expect-error
        return expect(repo.blocks.get('foo')).to.eventually.be.rejected().with.property('code', 'ERR_INVALID_CID')
      })

      it('throws ERR_NOT_FOUND when requesting non-dag-pb CID that is not in the store', async () => {
        const data = uint8ArrayFromString(`TEST${Math.random()}`)
        const digest = await sha256.digest(data)
        const cid = CID.createV1(dagPb.code, digest)

        await expect(repo.blocks.get(cid)).to.eventually.be.rejected().with.property('code', 'ERR_NOT_FOUND')
      })

      it('throws unknown error encountered when getting a block', async () => {
        const err = new Error('wat')
        const data = uint8ArrayFromString(`TEST${Math.random()}`)
        const digest = await sha256.digest(data)
        const cid = CID.createV0(digest)

        class ExplodingBlockStore extends BaseBlockstore {
          /**
           *
           * @param {CID} c
           */
          async get (c) {
            if (c.toString() === cid.toString()) {
              throw err
            }

            return new Uint8Array()
          }

          async open () {}

          async close () {}
        }

        otherRepo = createRepo(tempDir(), loadCodec, createBackend({
          blocks: new ExplodingBlockStore()
        }), {
          repoLock: MemoryLock
        })

        await otherRepo.init({})
        await otherRepo.open()

        await expect(otherRepo.blocks.get(cid)).to.eventually.be.rejectedWith(err)
      })

      it('can load an identity hash without storing first', async () => {
        const block = await repo.blocks.get(identityCID)
        expect(block).to.equalBytes(identityData)
      })
    })

    describe('.getMany', () => {
      /** @type {IPFSRepo} */
      let otherRepo

      after(async () => {
        if (otherRepo) {
          await otherRepo.close()
        }
      })

      it('simple', async () => {
        const blocks = await all(repo.blocks.getMany([pair.key]))
        expect(blocks).to.deep.include(pair.value)
      })

      it('including a block with identity hash', async () => {
        const blocks = await all(repo.blocks.getMany([pair.key, identityCID]))
        expect(blocks).to.deep.include(pair.value)
        expect(blocks).to.deep.include(identityData)
      })

      it('massive read', async () => {
        const num = 20 * 100

        const blocks = await all(repo.blocks.getMany(async function * () {
          for (let i = 0; i < num; i++) {
            const j = i % blockData.length
            const digest = await sha256.digest(blockData[j])

            yield CID.createV0(digest)
          }
        }()))

        expect(blocks).to.have.lengthOf(num)

        for (let i = 0; i < num; i++) {
          const j = i % blockData.length
          expect(blocks[i]).to.equalBytes(blockData[j])
        }
      })

      it('returns an error on invalid block', () => {
        // @ts-expect-error
        return expect(drain(repo.blocks.getMany(['woot']))).to.eventually.be.rejected()
      })

      it('should get block stored under v0 CID with a v1 CID', async () => {
        const data = uint8ArrayFromString(`TEST${Math.random()}`)
        const digest = await sha256.digest(data)
        const cid = CID.createV0(digest)
        await repo.blocks.put(cid, data)
        const block = await first(repo.blocks.getMany([cid.toV1()]))
        expect(block).to.equalBytes(data)
      })

      it('should get block stored under v1 CID with a v0 CID', async () => {
        const data = uint8ArrayFromString(`TEST${Math.random()}`)

        const digest = await sha256.digest(data)
        const cid = CID.createV1(dagPb.code, digest)
        await repo.blocks.put(cid, data)
        const block = await first(repo.blocks.getMany([cid.toV0()]))
        expect(block).to.equalBytes(data)
      })

      it('throws when passed an invalid cid', () => {
        // @ts-expect-error
        return expect(drain(repo.blocks.getMany(['foo']))).to.eventually.be.rejected().with.property('code', 'ERR_INVALID_CID')
      })

      it('throws ERR_NOT_FOUND when requesting non-dag-pb CID that is not in the store', async () => {
        const data = uint8ArrayFromString(`TEST${Math.random()}`)
        const digest = await sha256.digest(data)
        const cid = CID.createV1(dagCbor.code, digest)

        await expect(drain(repo.blocks.getMany([cid]))).to.eventually.be.rejected().with.property('code', 'ERR_NOT_FOUND')
      })

      it('throws unknown error encountered when getting a block', async () => {
        const err = new Error('wat')
        const data = uint8ArrayFromString(`TEST${Math.random()}`)
        const digest = await sha256.digest(data)
        const cid = CID.createV0(digest)

        class ExplodingBlockStore extends BaseBlockstore {
          /**
           * @param {CID} c
           */
          async get (c) {
            if (c.toString() === cid.toString()) {
              throw err
            }
            return new Uint8Array()
          }

          async open () {}

          async close () {}

          /**
           * @param {any} source
           */
          async * getMany (source) {
            for await (const c of source) {
              yield this.get(c)
            }
          }
        }

        otherRepo = createRepo(tempDir(), loadCodec, createBackend({
          blocks: new ExplodingBlockStore()
        }), {
          repoLock: MemoryLock
        })

        await otherRepo.init({})
        await otherRepo.open()

        await expect(drain(otherRepo.blocks.getMany([cid]))).to.eventually.be.rejectedWith(err)
      })
    })

    describe('.has', () => {
      it('existing block', async () => {
        const exists = await repo.blocks.has(pair.key)
        expect(exists).to.eql(true)
      })

      it('identity hash block, not written to store', async () => {
        const exists = await repo.blocks.has(identityCID)
        expect(exists).to.eql(true)
      })

      it('non existent block', async () => {
        const exists = await repo.blocks.has(CID.parse('QmbcpFjzamCj5ZZdduW32ctWUPvbGMwQZk2ghWK6PrKswE'))
        expect(exists).to.eql(false)
      })

      it('should have block stored under v0 CID with a v1 CID', async () => {
        const data = uint8ArrayFromString(`TEST${Math.random()}`)
        const digest = await sha256.digest(data)
        const cid = CID.createV0(digest)
        await repo.blocks.put(cid, data)
        const exists = await repo.blocks.has(cid.toV1())
        expect(exists).to.eql(true)
      })

      it('should have block stored under v1 CID with a v0 CID', async () => {
        const data = uint8ArrayFromString(`TEST${Math.random()}`)

        const digest = await sha256.digest(data)
        const cid = CID.createV1(dagCbor.code, digest)
        await repo.blocks.put(cid, data)
        const exists = await repo.blocks.has(CID.createV0(digest))
        expect(exists).to.eql(true)
      })

      it('throws when passed an invalid cid', () => {
        // @ts-expect-error
        return expect(() => repo.blocks.has('foo')).to.throw().with.property('code', 'ERR_INVALID_CID')
      })

      it('returns false when requesting non-dag-pb CID that is not in the store', async () => {
        const data = uint8ArrayFromString(`TEST${Math.random()}`)
        const digest = await sha256.digest(data)
        const cid = CID.createV1(dagCbor.code, digest)
        const result = await repo.blocks.has(cid)

        expect(result).to.be.false()
      })
    })

    describe('.delete', () => {
      it('simple', async () => {
        await repo.blocks.delete(pair.key)
        const exists = await repo.blocks.has(pair.key)
        expect(exists).to.equal(false)
      })

      it('identity cid does nothing', async () => {
        await repo.blocks.delete(identityCID)
        const exists = await repo.blocks.has(identityCID)
        expect(exists).to.equal(true)
      })

      it('throws when passed an invalid cid', () => {
        // @ts-expect-error
        return expect(() => repo.blocks.delete('foo')).to.throw().with.property('code', 'ERR_INVALID_CID')
      })
    })

    describe('.deleteMany', () => {
      it('simple', async () => {
        const deleted = await all(repo.blocks.deleteMany([pair.key]))
        const exists = await repo.blocks.has(pair.key)
        expect(exists).to.equal(false)
        expect(deleted).to.have.lengthOf(1)
        expect(deleted[0]).to.deep.equal(pair.key)
      })

      it('including identity cid', async () => {
        await drain(repo.blocks.deleteMany([pair.key, identityCID]))
        const exists = await repo.blocks.has(pair.key)
        expect(exists).to.equal(false)
        const identityExists = await repo.blocks.has(identityCID)
        expect(identityExists).to.equal(true)
      })

      it('throws when passed an invalid cid', () => {
        // @ts-expect-error invalid key type
        return expect(drain(repo.blocks.deleteMany(['foo']))).to.eventually.be.rejected().with.property('code', 'ERR_INVALID_CID')
      })
    })

    describe('.query', () => {
      /** @type {Pair} */
      let pair1
      /** @type {Pair} */
      let pair2

      before(async () => {
        pair1 = await makePair()
        pair2 = await makePair()

        await repo.blocks.put(pair1.key, pair1.value)
        await repo.blocks.put(pair2.key, pair2.value)
      })

      it('returns key/values for block data', async () => {
        const blocks = await all(repo.blocks.query({
          filters: [
            ({ value }) => uint8ArrayEquals(value, pair1.value)
          ]
        }))

        expect(blocks).to.have.lengthOf(1)
        expect(blocks[0]).to.have.nested.property('key.bytes').that.equalBytes(pair1.key.bytes)
        expect(blocks[0]).to.have.property('value').that.equalBytes(pair1.value)
      })

      // CID prefixes don't make much sense so not sure how useful this test is
      it.skip('returns some of the blocks', async () => {
        const blocksWithPrefix = await all(repo.blocks.query({
          prefix: pair1.key.toString().substring(0, 17)
        }))
        const block = blocksWithPrefix.find(({ key, value }) => uint8ArrayToString(value, 'base64') === uint8ArrayToString(pair1.value, 'base64'))

        expect(block).to.be.ok()
        expect(block?.key.bytes).to.equalBytes(pair1.key.bytes)
        expect(block?.value).to.equalBytes(pair1.value)

        const allBlocks = await all(repo.blocks.query({}))
        expect(blocksWithPrefix.length).to.be.lessThan(allBlocks.length)
      })

      it('returns only keys', async () => {
        const cids = await all(repo.blocks.queryKeys({}))

        expect(cids.length).to.be.greaterThan(0)

        for (const cid of cids) {
          expect(CID.asCID(cid)).to.be.ok()
        }
      })
    })
  })
}
