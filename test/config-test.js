/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

module.exports = (repo) => {
  describe('config', () => {
    describe('.set', () => {
      it('should throw when invalid key is passed', async () => {
        try {
          await repo.config.set(5, 'value')
          throw new Error('Should have thrown')
        } catch (err) {
          expect(err.code).to.equal('ERR_INVALID_KEY')
        }
      })

      it('should throw when invalid value is passed', async () => {
        try {
          await repo.config.set('foo', Buffer.from([0, 1, 2]))
          throw new Error('Should have thrown')
        } catch (err) {
          expect(err.code).to.equal('ERR_INVALID_VALUE')
        }
      })
    })
    describe('.get', () => {
      it('should throw NotFoundError when key does not exist', async () => {
        try {
          await repo.config.get('someRandomKey')
          throw new Error('Should have thrown')
        } catch (err) {
          expect(err.code).to.equal('ERR_NOT_FOUND')
        }
      })
    })
  })
}
