/* eslint-env mocha */
'use strict'

const { expect } = require('./utils/chai')
const { Key } = require('interface-datastore')
const CID = require('cids')
const Repo = require('../src')

module.exports = () => {
  describe('blockstore utils', () => {
    it('converts a CID to a datastore Key and back', () => {
      // CIDv1 in base32 with IPLD raw codec
      const originalCid = new CID('bafkreihkb3vrxxex5zvzkr3s3a6noe223r7jka4ofjy2nkzu27kueg76ii')
      const key = Repo.utils.blockstore.cidToKey(originalCid)
      expect(key instanceof Key).to.be.true()
      const cid = Repo.utils.blockstore.keyToCid(key)
      expect(cid instanceof CID).to.be.true()
      expect(originalCid.toString()).to.equal(cid.toString())
    })
  })
}
