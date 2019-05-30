/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

module.exports = (repo) => {
  describe('stat', () => {
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
      const stats = await repo.stat({ human: true })
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
  })
}
