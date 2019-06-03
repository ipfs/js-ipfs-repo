/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const apiAddr = require('../src/api-addr')

module.exports = () => {
  describe('api-addr', () => {
    describe('.get', () => {
      it('should get a value from the store', async () => {
        const api = apiAddr({
          get () {
            return true
          }
        })

        expect(await api.get()).to.equal('true')
      })
    })

    describe('.set', () => {
      it('should set a value in the store', () => {
        let val

        const api = apiAddr({
          put (key, value) {
            val = value
          }
        })

        api.set('0')

        expect(val).to.deep.equal(Buffer.from('0'))
      })
    })
  })
}
