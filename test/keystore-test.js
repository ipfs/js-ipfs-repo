/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

module.exports = (repo) => {
  describe('keystore', () => {
    it('exists', () => {
      expect(repo).to.have.property('keys')
    })
    it('implements interface-datastore', () => {
      const keys = repo.keys
      expect(keys.batch).to.exist()
      expect(keys.query).to.exist()
    })
  })
}
