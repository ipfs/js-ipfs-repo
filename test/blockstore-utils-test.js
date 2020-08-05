/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
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

    it('converts a CID to base32 encoded key', () => {
      // CIDv0 in base58btc with implicit dag-pb codec
      const originalCid = new CID('QmQPeNsJPyVWPFDVHb77w8G42Fvo15z4bG2X8D2GhfbSXc')
      const key = Repo.utils.blockstore.cidToKey(originalCid)
      expect(key instanceof Key).to.be.true()
      expect(key.toString()).to.equal('/CIQB4655YD5GLBB7WWEUAHCO6QONU5ICBONAA5JEPBIOEIVZ5RXTIYY')
      const cid = Repo.utils.blockstore.keyToCid(key)
      expect(cid instanceof CID).to.be.true()
      expect('bafkreia6po64b6tfqq73lckadrhpihg2oubaxgqaoushquhcek46y3zumm').to.equal(cid.toString())
      expect(cid.codec).to.equal('raw')
      expect(cid.version).to.equal(1)
      expect(cid.multihash).to.deep.equal(originalCid.multihash)
    })
  })
}
