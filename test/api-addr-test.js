/* eslint-env mocha */
'use strict'

const { expect } = require('./utils/chai')
const apiAddr = require('../src/api-addr')
const uint8ArrayFromString = require('ipfs-utils/src/uint8arrays/from-string')

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
      it('should set a value in the store', async () => {
        let val

        const api = apiAddr({
          put (key, value) {
            val = value
          }
        })

        await api.set('0')

        expect(val).to.deep.equal(uint8ArrayFromString('0'))
      })
    })
  })
}
