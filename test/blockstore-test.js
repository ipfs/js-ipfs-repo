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
const path = require('path')
const Key = require('interface-datastore').Key
const base32 = require('base32.js')
const IPFSRepo = require('../')

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
      let otherRepo

      after(async () => {
        if (otherRepo) {
          await otherRepo.close()
        }
      })

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

      it('massive multiwrite', async function () {
        this.timeout(15000) // add time for ci
        const hashes = await Promise.all(_.range(100).map((i) => multihashing(blockData[i], 'sha2-256')))
        await Promise.all(_.range(100).map((i) => {
          const block = new Block(blockData[i], new CID(hashes[i]))
          return repo.blocks.put(block)
        }))
      })

      it('.putMany', async function () {
        this.timeout(15000) // add time for ci
        const blocks = await Promise.all(_.range(50).map(async (i) => {
          const d = Buffer.from('many' + Math.random())
          const hash = await multihashing(d, 'sha2-256')
          return new Block(d, new CID(hash))
        }))
        await repo.blocks.putMany(blocks)
        for (const block of blocks) {
          const block1 = await repo.blocks.get(block.cid)
          expect(block1).to.be.eql(block)
        }
      })

      it('should not .putMany when block is already present', async () => {
        const data = Buffer.from(`TEST${Date.now()}`)
        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(hash)
        let putInvoked = false
        let commitInvoked = false
        otherRepo = new IPFSRepo(path.join(path.basename(repo.path), '/repo-' + Date.now()), {
          storageBackends: {
            blocks: class ExplodingBlockStore {
              close () {

              }

              has () {
                return true
              }

              batch () {
                return {
                  put () {
                    putInvoked = true
                  },
                  commit () {
                    commitInvoked = true
                  }
                }
              }
            }
          },
          storageBackendOptions: {
            blocks: {
              sharding: false
            }
          }
        })

        await otherRepo.init({})
        await otherRepo.open()

        await otherRepo.blocks.putMany([{
          cid,
          data
        }])

        expect(putInvoked).to.be.false()
        expect(commitInvoked).to.be.true()
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
      let otherRepo

      after(async () => {
        if (otherRepo) {
          await otherRepo.close()
        }
      })

      it('simple', async () => {
        const block = await repo.blocks.get(b.cid)
        expect(block).to.be.eql(b)
      })

      it('massive read', async function () {
        this.timeout(15000) // add time for ci
        await Promise.all(_.range(20 * 100).map(async (i) => {
          const j = i % blockData.length
          const hash = await multihashing(blockData[j], 'sha2-256')
          const block = await repo.blocks.get(new CID(hash))
          expect(block.data).to.be.eql(blockData[j])
        }))
      })

      it('returns an error on invalid block', async () => {
        try {
          await repo.blocks.get('woot')
        } catch (err) {
          expect(err).to.exist()
          return
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
        expect(block.data).to.eql(data)
      })

      it('throws when passed an invalid cid', async () => {
        try {
          await repo.blocks.get('foo')
          throw new Error('Should have thrown')
        } catch (err) {
          expect(err.code).to.equal('ERR_INVALID_CID')
        }
      })

      it('throws ERR_NOT_FOUND when requesting non-dag-pb CID that is not in the store', async () => {
        const data = Buffer.from(`TEST${Date.now()}`)
        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(1, 'dag-cbor', hash)

        try {
          await repo.blocks.get(cid)
        } catch (err) {
          expect(err.code).to.equal('ERR_NOT_FOUND')
        }
      })

      it('throws unknown error encountered when getting a block', async () => {
        const err = new Error('wat')
        const data = Buffer.from(`TEST${Date.now()}`)
        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(hash)
        const enc = new base32.Encoder()
        const key = new Key('/' + enc.write(cid.buffer).finalize(), false)

        otherRepo = new IPFSRepo(path.join(path.basename(repo.path), '/repo-' + Date.now()), {
          storageBackends: {
            blocks: class ExplodingBlockStore {
              close () {

              }

              get (c) {
                if (c.toString() === key.toString()) {
                  throw err
                }
              }
            }
          },
          storageBackendOptions: {
            blocks: {
              sharding: false
            }
          }
        })

        await otherRepo.init({})
        await otherRepo.open()

        try {
          await otherRepo.blocks.get(cid)
          throw new Error('Should have thrown')
        } catch (err2) {
          expect(err2).to.deep.equal(err)
        }
      })
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

      it('throws when passed an invalid cid', async () => {
        try {
          await repo.blocks.has('foo')
          throw new Error('Should have thrown')
        } catch (err) {
          expect(err.code).to.equal('ERR_INVALID_CID')
        }
      })

      it('returns false when requesting non-dag-pb CID that is not in the store', async () => {
        const data = Buffer.from(`TEST${Date.now()}`)
        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(1, 'dag-cbor', hash)
        const result = await repo.blocks.has(cid)

        expect(result).to.be.false()
      })
    })

    describe('.delete', () => {
      it('simple', async () => {
        await repo.blocks.delete(b.cid)
        const exists = await repo.blocks.has(b.cid)
        expect(exists).to.equal(false)
      })

      it('throws when passed an invalid cid', async () => {
        try {
          await repo.blocks.delete('foo')
          throw new Error('Should have thrown')
        } catch (err) {
          expect(err.code).to.equal('ERR_INVALID_CID')
        }
      })
    })
  })
}
