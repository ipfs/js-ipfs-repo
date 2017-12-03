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
  })
}
