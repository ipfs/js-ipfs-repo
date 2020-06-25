/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { Buffer } = require('buffer')
const { expect } = require('./utils/chai')
const Block = require('ipld-block')
const CID = require('cids')
const range = require('just-range')
const multihashing = require('multihashing-async')
const tempDir = require('ipfs-utils/src/temp-dir')
const { cidToKey, keyToCid } = require('../src/blockstore-utils')
const IPFSRepo = require('../')
const drain = require('it-drain')
const all = require('it-all')
const first = require('it-first')

async function makeBlock () {
  const bData = Buffer.from(`hello-${Math.random()}`)

  const hash = await multihashing(bData, 'sha2-256')
  return new Block(bData, new CID(hash))
}

module.exports = (repo) => {
  describe('blockstore', () => {
    const blockData = range(100).map((i) => Buffer.from(`hello-${i}-${Math.random()}`))
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
        const hashes = await Promise.all(range(100).map((i) => multihashing(blockData[i], 'sha2-256')))
        await Promise.all(range(100).map((i) => {
          const block = new Block(blockData[i], new CID(hashes[i]))
          return repo.blocks.put(block)
        }))
      })

      it('.putMany', async function () {
        this.timeout(15000) // add time for ci
        const blocks = await Promise.all(range(50).map(async (i) => {
          const d = Buffer.from('many' + Math.random())
          const hash = await multihashing(d, 'sha2-256')
          return new Block(d, new CID(hash))
        }))

        const put = await all(repo.blocks.putMany(blocks))
        expect(put).to.deep.equal(blocks)

        for (const block of blocks) {
          const block1 = await repo.blocks.get(block.cid)
          expect(block1).to.be.eql(block)
        }
      })

      it('returns an error on invalid block', () => {
        return expect(repo.blocks.put('hello')).to.eventually.be.rejected()
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
        await Promise.all(range(20 * 100).map(async (i) => {
          const j = i % blockData.length
          const hash = await multihashing(blockData[j], 'sha2-256')
          const block = await repo.blocks.get(new CID(hash))
          expect(block.data).to.be.eql(blockData[j])
        }))
      })

      it('returns an error on invalid block', () => {
        return expect(repo.blocks.get('woot')).to.eventually.be.rejected()
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

      it('throws when passed an invalid cid', () => {
        return expect(repo.blocks.get('foo')).to.eventually.be.rejected().with.property('code', 'ERR_INVALID_CID')
      })

      it('throws ERR_NOT_FOUND when requesting non-dag-pb CID that is not in the store', async () => {
        const data = Buffer.from(`TEST${Date.now()}`)
        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(1, 'dag-cbor', hash)

        await expect(repo.blocks.get(cid)).to.eventually.be.rejected().with.property('code', 'ERR_NOT_FOUND')
      })

      it('throws unknown error encountered when getting a block', async () => {
        const err = new Error('wat')
        const data = Buffer.from(`TEST${Date.now()}`)
        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(hash)
        const key = cidToKey(cid)

        otherRepo = new IPFSRepo(tempDir(), {
          storageBackends: {
            blocks: class ExplodingBlockStore {
              open () {}
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

    describe('.getMany', () => {
      let otherRepo

      after(async () => {
        if (otherRepo) {
          await otherRepo.close()
        }
      })

      it('simple', async () => {
        const blocks = await all(repo.blocks.getMany([b.cid]))
        expect(blocks).to.deep.include(b)
      })

      it('massive read', async function () {
        this.timeout(15000) // add time for ci
        const num = 20 * 100

        const blocks = await all(repo.blocks.getMany(async function * () {
          for (let i = 0; i < num; i++) {
            const j = i % blockData.length
            const hash = await multihashing(blockData[j], 'sha2-256')

            yield new CID(hash)
          }
        }()))

        expect(blocks).to.have.lengthOf(num)

        for (let i = 0; i < num; i++) {
          const j = i % blockData.length
          expect(blocks[i]).to.have.deep.property('data', blockData[j])
        }
      })

      it('returns an error on invalid block', () => {
        return expect(drain(repo.blocks.getMany(['woot']))).to.eventually.be.rejected()
      })

      it('should get block stored under v0 CID with a v1 CID', async () => {
        const data = Buffer.from(`TEST${Date.now()}`)
        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(hash)
        await repo.blocks.put(new Block(data, cid))
        const block = await first(repo.blocks.getMany([cid.toV1()]))
        expect(block.data).to.eql(data)
      })

      it('should get block stored under v1 CID with a v0 CID', async () => {
        const data = Buffer.from(`TEST${Date.now()}`)

        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(1, 'dag-pb', hash)
        await repo.blocks.put(new Block(data, cid))
        const block = await first(repo.blocks.getMany([cid.toV0()]))
        expect(block.data).to.eql(data)
      })

      it('throws when passed an invalid cid', () => {
        return expect(drain(repo.blocks.getMany(['foo']))).to.eventually.be.rejected().with.property('code', 'ERR_INVALID_CID')
      })

      it('throws ERR_NOT_FOUND when requesting non-dag-pb CID that is not in the store', async () => {
        const data = Buffer.from(`TEST${Date.now()}`)
        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(1, 'dag-cbor', hash)

        await expect(drain(repo.blocks.getMany([cid]))).to.eventually.be.rejected().with.property('code', 'ERR_NOT_FOUND')
      })

      it('throws unknown error encountered when getting a block', async () => {
        const err = new Error('wat')
        const data = Buffer.from(`TEST${Date.now()}`)
        const hash = await multihashing(data, 'sha2-256')
        const cid = new CID(hash)
        const key = cidToKey(cid)

        otherRepo = new IPFSRepo(tempDir(), {
          storageBackends: {
            blocks: class ExplodingBlockStore {
              open () {}
              close () {

              }

              get (c) {
                if (c.toString() === key.toString()) {
                  throw err
                }
              }

              async * getMany (source) {
                for await (const c of source) {
                  yield this.get(c)
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
          await drain(otherRepo.blocks.getMany([cid]))
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

      it('throws when passed an invalid cid', () => {
        return expect(repo.blocks.has('foo')).to.eventually.be.rejected().with.property('code', 'ERR_INVALID_CID')
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

      it('throws when passed an invalid cid', () => {
        return expect(repo.blocks.delete('foo')).to.eventually.be.rejected().with.property('code', 'ERR_INVALID_CID')
      })
    })

    describe('.deleteMany', () => {
      it('simple', async () => {
        await drain(repo.blocks.deleteMany([b.cid]))
        const exists = await repo.blocks.has(b.cid)
        expect(exists).to.equal(false)
      })

      it('throws when passed an invalid cid', () => {
        return expect(drain(repo.blocks.deleteMany(['foo']))).to.eventually.be.rejected().with.property('code', 'ERR_INVALID_CID')
      })
    })

    describe('.query', () => {
      let block1
      let block2

      before(async () => {
        block1 = await makeBlock()
        block2 = await makeBlock()

        await repo.blocks.put(block1)
        await repo.blocks.put(block2)
      })

      it('returns key/values for block data', async () => {
        const results = await all(repo.blocks.query({}))
        const result = results.find(result => result.value.toString('base64') === block1.data.toString('base64'))

        expect(result).to.be.ok()
        expect(keyToCid(result.key).multihash).to.deep.equal(block1.cid.multihash)
        expect(result.value).to.deep.equal(block1.data)
      })

      it('returns some of the blocks', async () => {
        const resultsWithPrefix = await all(repo.blocks.query({
          prefix: cidToKey(block1.cid).toString().substring(0, 10)
        }))
        const result = resultsWithPrefix.find(result => result.value.toString('base64') === block1.data.toString('base64'))

        expect(result).to.be.ok()
        expect(keyToCid(result.key).multihash).to.deep.equal(block1.cid.multihash)
        expect(result.value).to.deep.equal(block1.data)

        const allResults = await all(repo.blocks.query({}))
        expect(resultsWithPrefix.length).to.be.lessThan(allResults.length)
      })

      it('returns only keys', async () => {
        const results = await all(repo.blocks.query({
          keysOnly: true
        }))

        expect(results.length).to.be.greaterThan(0)

        for (const result of results) {
          expect(result).to.have.property('key')
          expect(result).to.not.have.property('value')
        }
      })
    })
  })
}
