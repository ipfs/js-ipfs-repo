/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const mh = require('multihashes')
const CID = require('cids')
const Key = require('interface-datastore').Key
const map = require('async/map')

module.exports = (repo) => {
  describe.only('interop', () => {
    it('reads welcome-to-ipfs', (done) => {
      const welcomeHash = mh.fromHexString(
        '1220120f6af601d46e10b2d2e11ed71c55d25f3042c22501e41d1246e7a1e9d3d8ec'
      )

      repo.blocks.get(new CID(welcomeHash), (err, val) => {
        expect(err).to.not.exist()
        expect(
          val.data.toString()
        ).to.match(
            /Hello and Welcome to IPFS/
        )
        done()
      })
    })

    it('reads a bunch of blocks', (done) => {
      const cids = [
        'QmUxpzJGJYTK5AzH36jV9ucM2WdF5KhjANb4FAhqnREzuC',
        'QmQbb26h9dcU5iNPMNEzYZnZN9YLTXBtFwuHmmo6YU4Aig'
      ].map((hash) => new CID(mh.fromB58String(hash)))

      map(cids, repo.blocks.get, (err, values) => {
        expect(err).to.not.exist()
        expect(values.length).to.equal(2)
        expect(values.map(value => value.data.length)).to.deep.equal([2659, 12783])
        done()
      })
    })

    it('reads pin set from the datastore', (done) => {
      repo.datastore.get(new Key('/local/pins'), (err, val) => {
        expect(err).to.not.exist()
        expect(mh.toB58String(val)).to.be.equal('QmYAuyf2LzMba65NnhxLtGJxixKNUev9qYSu4MYM88hdwK')
        done()
      })
    })

    it('reads DHT records from the datastore', (done) => {
      repo.datastore.get(new Key('/AHE5I5B7TY'), (err, val) => {
        expect(err).to.not.exist()
        expect(val.toString('hex')).to.deep.equal('0a0601c9d4743f9e12097465737476616c75651a2212201d22e2a5e140e5cd20d88fc59cd560f4887c7d9acf938ddb24d7207eac40fd2f')
        done()
      })
    })
  })
}
