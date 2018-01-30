/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

module.exports = (repo) => {
  describe('stat', () => {
    it('get stats', (done) => {
      repo.stat((err, stats) => {
        expect(err).to.not.exist()
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
        done()
      })
    })

    it('get human stats', (done) => {
      repo.stat({human: true}, (err, stats) => {
        expect(err).to.not.exist()
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
        done()
      })
    })
  })
}
