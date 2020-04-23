/* eslint-env mocha */
'use strict'

const { expect } = require('./utils/chai')
const { Key } = require('interface-datastore')
const CID = require('cids')
const Repo = require('../src')

module.exports = () => {
  describe('blockstore utils', () => {
    it('converts a CID to a datastore Key and back', () => {
      const originalCid = new CID('Qme6KJdKcp85TYbLxuLV7oQzMiLremD7HMoXLZEmgo6Rnh')
      const key = Repo.utils.blockstore.cidToKey(originalCid)
      expect(key instanceof Key).to.be.true()
      const cid = Repo.utils.blockstore.keyToCid(key)
      expect(cid instanceof CID).to.be.true()
      expect(originalCid.toString()).to.equal(cid.toString())
    })
  })
}
