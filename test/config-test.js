/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const errors = require('../src/errors')

module.exports = (repo) => {
  describe('config', () => {
    describe('.set', () => {
      it('should throw when invalid key is passed', async () => {
        try {
          await repo.config.set(5, 'value')
          throw new Error('Should have thrown')
        } catch (err) {
          expect(err.code).to.equal(errors.ERR_INVALID_KEY.code)
        }
      })

      it('should throw when invalid value is passed', async () => {
        try {
          await repo.config.set('foo', Buffer.from([0, 1, 2]))
          throw new Error('Should have thrown')
        } catch (err) {
          expect(err.code).to.equal(errors.ERR_INVALID_VALUE.code)
        }
      })
    })
    describe('.get', () => {
      it('should throw NotFoundError when key does not exist', async () => {
        try {
          await repo.config.get('someRandomKey')
          throw new Error('Should have thrown')
        } catch (err) {
          expect(err.code).to.equal(errors.ERR_NOT_FOUND.code)
        }
      })
    })
  })
}
