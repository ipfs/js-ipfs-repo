/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const Error = require('../src/errors')

module.exports = (repo) => {
  describe('IPFS Repo Tests', () => {
    it('check if Repo exists', async () => {
      const exists = await repo.exists()
      expect(exists).to.equal(true)
    })

    it('exposes the path', () => {
      expect(repo.path).to.be.a('string')
    })

    describe('config', () => {
      it('get config', async () => {
        const config = await repo.config.get()
        expect(config).to.be.a('object')
      })

      it('set config', async () => {
        await repo.config.set({ a: 'b' })
        const config = await repo.config.get()
        expect(config).to.deep.equal({ a: 'b' })
      })

      it('get config key', async () => {
        const value = await repo.config.get('a')
        expect(value).to.equal('b')
      })

      it('set config key', async () => {
        await repo.config.set('c.x', 'd')
        const config = await repo.config.get()
        expect(config).to.deep.equal({ a: 'b', c: { x: 'd' } })
      })
    })

    describe('spec', () => {
      it('get spec', async () => {
        await repo.spec.get()
      })

      it('set spec', async () => {
        await repo.spec.set({ a: 'b' })
        const spec = await repo.spec.get()
        expect(spec).to.deep.equal({ a: 'b' })
      })
    })

    describe('version', () => {
      it('get version', async () => {
        const version = await repo.version.get()
        expect(version).to.equal(7)
      })

      it('set version', async () => {
        await repo.version.set(9000)
        await repo.version.get()
        await repo.version.set(7)
      })
    })

    describe('lifecycle', () => {
      it('close and open', async () => {
        await repo.close()
        await repo.open()
        await repo.close()
        await repo.open()
        const version = await repo.version.get()
        expect(version).to.exist()
      })

      it('close twice throws error', async () => {
        await repo.close()
        try {
          await repo.close()
        } catch (err) {
          expect(err.code).to.eql(Error.ERR_REPO_ALREADY_CLOSED)
          return
        }
        expect.fail('Did not throw')
      })

      it('open twice throws error', async () => {
        await repo.open()
        try {
          await repo.open()
        } catch (err) {
          expect(err.code).to.eql(Error.ERR_REPO_ALREADY_OPEN)
          return
        }
        expect.fail('Did not throw')
      })
    })
  })
}
