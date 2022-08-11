/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/chai'

/**
 * @param {import('../src/types').IPFSRepo} repo
 */
export default (repo) => {
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
