/* eslint-env mocha */
'use strict'

const { expect } = require('./utils/chai')

module.exports = (repo) => {
  describe('config', () => {
    describe('.set', () => {
      it('should throw when invalid key is passed', () => {
        return expect(repo.config.set(5, 'value')).to.eventually.be.rejected().with.property('code', 'ERR_INVALID_KEY')
      })

      it('should throw when invalid value is passed', () => {
        return expect(repo.config.set('foo', Uint8Array.from([0, 1, 2]))).to.eventually.be.rejected().with.property('code', 'ERR_INVALID_VALUE')
      })
    })
    describe('.get', () => {
      it('should throw NotFoundError when key does not exist', () => {
        return expect(repo.config.get('someRandomKey')).to.eventually.be.rejected().with.property('code', 'ERR_NOT_FOUND')
      })
    })
    describe('.getAll', () => {
      it('should return the whole conifg', async () => {
        const thing = await repo.config.getAll()

        expect(thing).to.deep.equal(await repo.config.get())
      })
    })
    describe('.replace', () => {
      it('should replace the whole conifg', async () => {
        expect({}).to.not.deep.equal(await repo.config.get())

        await repo.config.replace({})

        expect({}).to.deep.equal(await repo.config.get())
      })
    })
  })
}
