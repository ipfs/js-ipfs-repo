/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const { CID } = require('multiformats/cid')
const uint8ArrayFromString = require('uint8arrays/from-string')
/**
 * @param {import('../src/index')} repo
 */
module.exports = (repo) => {
  describe('stat', () => {
    before(async () => {
      await repo.blocks.put(
        CID.parse('bafyreighz6vdlkdsvp4nu3lxhsofnk2eqxn6o57ag3mfxkqa7c327djhra'),
        uint8ArrayFromString('foo')
      )
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
