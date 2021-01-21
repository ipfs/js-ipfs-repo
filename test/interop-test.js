/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const mh = require('multihashing-async').multihash
const CID = require('cids')
const Key = require('interface-datastore').Key
const uint8ArrayToString = require('uint8arrays/to-string')

/**
 * @param {import("../src/index")} repo
 */
module.exports = (repo) => {
  describe('interop', () => {
    it('reads welcome-to-ipfs', async () => {
      const welcomeHash = mh.fromHexString(
        '1220120f6af601d46e10b2d2e11ed71c55d25f3042c22501e41d1246e7a1e9d3d8ec'
      )

      const val = await repo.blocks.get(new CID(welcomeHash))
      expect(uint8ArrayToString(val.data)).to.match(/Hello and Welcome to IPFS/)
    })

    it('reads a bunch of blocks', async () => {
      const cids = [
        'QmUxpzJGJYTK5AzH36jV9ucM2WdF5KhjANb4FAhqnREzuC',
        'QmQbb26h9dcU5iNPMNEzYZnZN9YLTXBtFwuHmmo6YU4Aig'
      ].map((hash) => new CID(mh.fromB58String(hash)))

      const values = await Promise.all(cids.map((cid) => repo.blocks?.get(cid)))
      expect(values.length).to.equal(2)
      expect(values.map((value) => value.data.length)).to.eql([2659, 12783])
    })

    it('reads DHT records from the datastore', async () => {
      const val = await repo.datastore?.get(new Key('/AHE5I5B7TY'))
      expect(uint8ArrayToString(val, 'base16')).to.eql('0a0601c9d4743f9e12097465737476616c75651a2212201d22e2a5e140e5cd20d88fc59cd560f4887c7d9acf938ddb24d7207eac40fd2f')
    })
  })
}
