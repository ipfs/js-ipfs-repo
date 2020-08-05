/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const range = require('just-range')
const Key = require('interface-datastore').Key
const uint8ArrayFromString = require('uint8arrays/from-string')

module.exports = (repo) => {
  describe('pins', () => {
    const dataList = range(100).map((i) => uint8ArrayFromString(`hello-${i}-${Math.random()}`))
    const data = uint8ArrayFromString('hello world')
    const b = new Key('hello')

    it('exists', () => {
      expect(repo).to.have.property('pins')
    })

    describe('.put', () => {
      it('simple', async () => {
        await repo.pins.put(b, data)
      })

      it('multi write (locks)', async () => {
        await Promise.all([repo.pins.put(b, data), repo.pins.put(b, data)])
      })

      it('massive multiwrite', async function () {
        this.timeout(15000) // add time for ci
        await Promise.all(range(100).map((i) => {
          return repo.pins.put(new Key('hello' + i), dataList[i])
        }))
      })
    })

    describe('.get', () => {
      it('simple', async () => {
        const val = await repo.pins.get(b)
        expect(val).to.be.eql(data)
      })

      it('massive read', async function () {
        this.timeout(15000) // add time for ci
        await Promise.all(range(20 * 100).map(async (i) => {
          const j = i % dataList.length
          const val = await repo.pins.get(new Key('hello' + j))
          expect(val).to.be.eql(dataList[j])
        }))
      }).timeout(10 * 1000)
    })

    describe('.has', () => {
      it('existing pin', async () => {
        const exists = await repo.pins.has(b)
        expect(exists).to.eql(true)
      })

      it('non existent pin', async () => {
        const exists = await repo.pins.has(new Key('world'))
        expect(exists).to.eql(false)
      })
    })

    describe('.delete', () => {
      it('simple', async () => {
        await repo.pins.delete(b)
        const exists = await repo.pins.has(b)
        expect(exists).to.equal(false)
      })
    })
  })
}
