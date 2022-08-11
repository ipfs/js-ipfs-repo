/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { CID } from 'multiformats/cid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

/**
 * @param {import('../src/types').IPFSRepo} repo
 */
export default (repo) => {
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
