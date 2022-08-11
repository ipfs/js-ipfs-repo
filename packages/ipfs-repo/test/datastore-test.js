/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/chai'
import range from 'just-range'
import { Key } from 'interface-datastore/key'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

/**
 * @param {import('../src/types').IPFSRepo} repo
 */
export default (repo) => {
  describe('datastore', () => {
    const dataList = range(100).map((i) => uint8ArrayFromString(`hello-${i}-${Math.random()}`))
    const data = uint8ArrayFromString('hello world')
    const b = new Key('hello')

    describe('.put', () => {
      it('simple', async () => {
        await repo.datastore.put(b, data)
      })

      it('multi write (locks)', async () => {
        await Promise.all([repo.datastore.put(b, data), repo.datastore.put(b, data)])
      })

      it('massive multiwrite', async () => {
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

      it('massive read', async () => {
        await Promise.all(range(20 * 100).map(async (i) => {
          const j = i % dataList.length
          const val = await repo.datastore.get(new Key('hello' + j))
          expect(val).to.be.eql(dataList[j])
        }))
      })
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
