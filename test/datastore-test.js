/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { Buffer } = require('buffer')
const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const range = require('just-range')
const Key = require('interface-datastore').Key

module.exports = (repo) => {
  describe('datastore', () => {
    const dataList = range(100).map((i) => Buffer.from(`hello-${i}-${Math.random()}`))
    const data = Buffer.from('hello world')
    const b = new Key('hello')

    describe('.put', () => {
      it('simple', async () => {
        await repo.datastore.put(b, data)
      })

      it('multi write (locks)', async () => {
        await Promise.all([repo.datastore.put(b, data), repo.datastore.put(b, data)])
      })

      it('massive multiwrite', async function () {
        this.timeout(15000) // add time for ci
        await Promise.all(range(100).map((i) => {
          return repo.datastore.put(new Key('hello' + i), dataList[i])
        }))
      })
    })

    describe('.get', () => {
      it('simple', async () => {
        const val = await repo.datastore.get(b)
        expect(val).to.be.eql(data)
      })

      it('massive read', async function () {
        this.timeout(15000) // add time for ci
        await Promise.all(range(20 * 100).map(async (i) => {
          const j = i % dataList.length
          const val = await repo.datastore.get(new Key('hello' + j))
          expect(val).to.be.eql(dataList[j])
        }))
      }).timeout(10 * 1000)
    })

    describe('.has', () => {
      it('existing entry', async () => {
        const exists = await repo.datastore.has(b)
        expect(exists).to.eql(true)
      })

      it('non existent block', async () => {
        const exists = await repo.datastore.has(new Key('world'))
        expect(exists).to.eql(false)
      })
    })

    describe('.delete', () => {
      it('simple', async () => {
        await repo.datastore.delete(b)
        const exists = await repo.datastore.has(b)
        expect(exists).to.equal(false)
      })
    })
  })
}
