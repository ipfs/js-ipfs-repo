/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const Block = require('ipfs-block')
const CID = require('cids')
const prettyBytes = require('pretty-bytes')

module.exports = (repo) => {
  describe('stat', () => {
    before(async () => {
      const data = new Block(
        Buffer.from('foo'),
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

      expect(stats.numObjects > '0').to.eql(true)
      expect(stats.version > '0').to.eql(true)
      expect(stats.repoSize > '0').to.eql(true)
      expect(stats.storageMax > '0').to.eql(true)
    })

    it('get human stats', async () => {
      const { repoSize, storageMax } = await repo.stat()

      const humanizedRepoSize = prettyBytes(repoSize.toNumber()).toUpperCase()
      const humanizedStorageMax = prettyBytes(storageMax.toNumber()).toUpperCase()

      const humanizedStats = await repo.stat({ human: true })

      expect(humanizedStats).to.exist()
      expect(humanizedStats).to.have.property('numObjects')
      expect(humanizedStats).to.have.property('version').and.be.above(0)
      expect(humanizedStats).to.have.property('repoPath')
      expect(humanizedStats).to.have.property('repoSize').that.equals(humanizedRepoSize)
      expect(humanizedStats).to.have.property('storageMax').that.equals(humanizedStorageMax)

      expect(humanizedStats.numObjects > '0').to.eql(true)
      expect(humanizedStats.repoSize > '0').to.eql(true)
      expect(humanizedStats.storageMax > '0').to.eql(true)
    })
  })
}
