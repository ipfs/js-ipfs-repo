/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const Block = require('ipld-block')
const CID = require('cids')
const uint8ArrayFromString = require('uint8arrays/from-string')
/**
 * @param {import('../src/index')} repo
 */
module.exports = (repo) => {
  describe('stat', () => {
    before(async () => {
      const data = new Block(
        uint8ArrayFromString('foo'),
        new CID('bafyreighz6vdlkdsvp4nu3lxhsofnk2eqxn6o57ag3mfxkqa7c327djhra')
      )
      await repo.blocks.put(data)
    })

    it('get stats', async () => {
      const stats = await repo.stat()
      expect(stats).to.exist()
      expect(stats).to.have.property('numObjects')
      expect(stats).to.have.property('version')
      expect(stats).to.have.property('repoPath')
      expect(stats).to.have.property('repoSize')
      expect(stats).to.have.property('storageMax')

      expect(stats.numObjects > 0n).to.eql(true)
      expect(stats.version > 0).to.eql(true)
      expect(stats.repoSize > 0n).to.eql(true)
      expect(stats.storageMax > 0n).to.eql(true)
    })
  })
}
