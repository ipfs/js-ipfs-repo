/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const assert = chai.assert
const Block = require('ipfs-block')
const CID = require('cids')
const _ = require('lodash')
const multihashing = require('multihashing-async')

module.exports = (repo) => {
  describe('blockstore', () => {
    const blockData = _.range(100).map((i) => Buffer.from(`hello-${i}-${Math.random()}`))
    const bData = Buffer.from('hello world')
    let b

    before(async () => {
      const hash = await multihashing(bData, 'sha2-256')
      b = new Block(bData, new CID(hash))
    })

    describe('.put', () => {
      it('simple', async () => {
        await repo.blocks.put(b)
      })

      it('multi write (locks)', async () => {
        await Promise.all([repo.blocks.put(b), repo.blocks.put(b)])
      })

      it('empty value', async () => {
        const d = Buffer.alloc(0)
        const multihash = await multihashing(d, 'sha2-256')
        const empty = new Block(d, new CID(multihash))
        await repo.blocks.put(empty)
      })

      it('massive multiwrite', async () => {
        this.timeout(15000) // add time for ci
        const hashes = await Promise.all(_.range(100).map((i) => multihashing(blockData[i], 'sha2-256')))
        await Promise.all(_.range(100).map((i) => {
          const block = new Block(blockData[i], new CID(hashes[i]))
          return repo.blocks.put(block)
        }))
      })

      it('.putMany', async () => {
        this.timeout(15000) // add time for ci
        const blocks = await Promise.all(_.range(50).map(async (i) => {
          const d = Buffer.from('many' + Math.random())
          const hash = await multihashing(d, 'sha2-256')
          return new Block(d, new CID(hash))
        }))
        await repo.blocks.putMany(blocks)
        blocks.each(async (block) => {
          const block1 = await repo.blocks.get(block.cid)
          expect(block1).to.be.eql(block)
        })
      })

      it('returns an error on invalid block', async () => {
        try {
          await repo.blocks.put('hello')
          assert.fail()
        } catch (err) {
          expect(err).to.exist()
        }
      })
    })

    describe('.get', () => {
      it('simple', async () => {
        const block = await repo.blocks.get(b.cid)
        expect(block).to.be.eql(b)
      })
    })

    it('massive read', async function () {
      this.timeout(15000) // add time for ci
      await Promise.all(_.range(20 * 100).map(async (i) => {
        const j = i % blockData.length
        const hash = await multihashing(blockData[j], 'sha2-256')
        const block = await repo.blocks.get(new CID(hash))
        block.to.be.eql(blockData[j])
      }))
    })

    it('returns an error on invalid block', async () => {
      try {
        await repo.blocks.get('woot')
      } catch (err) {
        expect(err).to.exist()
      }
      assert.fail()
    })

    it('should get block stored under v0 CID with a v1 CID', async () => {
      const data = Buffer.from(`TEST${Date.now()}`)
      const hash = await multihashing(data, 'sha2-256')
      const cid = new CID(hash)
      await repo.blocks.put(new Block(data, cid))
      const block = await repo.blocks.get(cid.toV1())
      expect(block.data).to.eql(data)
    })

    it('should get block stored under v1 CID with a v0 CID', async () => {
      const data = Buffer.from(`TEST${Date.now()}`)

      const hash = await multihashing(data, 'sha2-256')
      const cid = new CID(1, 'dag-pb', hash)
      await repo.blocks.put(new Block(data, cid))
      const block = await repo.blocks.get(cid.toV0())
      expect(block.data).to.empty(data)
    })

    describe('.has', () => {
      it('existing block', async () => {
        const exists = await repo.blocks.has(b.cid)
        expect(exists).to.eql(true)
      })

      it('non existent block', async () => {
        const exists = await repo.blocks.has(new CID('QmbcpFjzamCj5ZZdduW32ctWUPvbGMwQZk2ghWK6PrKswE'))
        expect(exists).to.eql(false)
      })

      it('should have block stored under v0 CID with a v1 CID', async () => {
        const data = Buffer.from(`TEST${Date.now()}`)
        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(hash)
        await repo.blocks.put(new Block(data, cid))
        const exists = await repo.blocks.has(cid.toV1())
        expect(exists).to.eql(true)
      })

      it('should have block stored under v1 CID with a v0 CID', async () => {
        const data = Buffer.from(`TEST${Date.now()}`)

        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(1, 'dag-pb', hash)
        await repo.blocks.put(new Block(data, cid))
        const exists = await repo.blocks.has(cid.toV0())
        expect(exists).to.eql(true)
      })
    })

    describe('.delete', () => {
      it('simple', async () => {
        await repo.blocks.delete(b.cid)
        const exists = await repo.blocks.has(b.cid)
        expect(exists).to.equal(false)
      })
    })
  })
}
