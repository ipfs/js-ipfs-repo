/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const sinon = require('sinon')

const migrator = require('ipfs-repo-migrations')
const constants = require('../src/constants')
const errors = require('../src/errors')
const IPFSRepo = require('../src')

module.exports = (createTempRepo) => {
  describe('Migrations tests', () => {
    let teardown
    let repo
    let migrateStub
    let repoVersionStub
    let getLatestMigrationVersionStub

    before(() => {
      repoVersionStub = sinon.stub(constants, 'repoVersion')
      migrateStub = sinon.stub(migrator, 'migrate')
      getLatestMigrationVersionStub = sinon.stub(migrator, 'getLatestMigrationVersion')
    })

    after(() => {
      repoVersionStub.restore()
      migrateStub.restore()
      getLatestMigrationVersionStub.restore()
    })

    beforeEach(async () => {
      ({ instance: repo, teardown } = await createTempRepo({}))
      sinon.reset()
    })

    afterEach(async () => {
      await teardown()
    })

    it('should migrate by default', async () => {
      migrateStub.resolves()
      repoVersionStub.value(8)
      getLatestMigrationVersionStub.returns(9)

      await repo.version.set(7)
      await repo.close()

      expect(migrateStub.called).to.be.false()

      await repo.open()

      expect(migrateStub.called).to.be.true()
    })

    it('should not migrate when option autoMigrate is false', async () => {
      migrateStub.resolves()
      repoVersionStub.resolves(8)
      getLatestMigrationVersionStub.returns(9)

      await repo.version.set(7)
      await repo.close()

      const newOpts = Object.assign({}, repo.options)
      newOpts.autoMigrate = false
      const newRepo = new IPFSRepo(repo.path, newOpts)

      expect(migrateStub.called).to.be.false()
      try {
        await newRepo.open()
        throw Error('Should throw error')
      } catch (e) {
        expect(e.code).to.equal(errors.InvalidRepoVersionError.code)
      }

      expect(migrateStub.called).to.be.false()
    })

    it('should not migrate when config option repoAutoMigrate is false', async () => {
      migrateStub.resolves()
      repoVersionStub.resolves(8)
      getLatestMigrationVersionStub.returns(9)

      await repo.config.set('repoAutoMigrate', false)
      await repo.version.set(7)
      await repo.close()

      expect(migrateStub.called).to.be.false()
      try {
        await repo.open()
        throw Error('Should throw error')
      } catch (e) {
        expect(migrateStub.called).to.be.false()
        expect(e.code).to.equal(errors.InvalidRepoVersionError.code)
      }
    })

    it('should not migrate when versions matches', async () => {
      migrateStub.resolves()
      repoVersionStub.value(8)

      await repo.version.set(8)
      await repo.close()

      expect(migrateStub.called).to.be.false()

      await repo.open()

      expect(migrateStub.called).to.be.false()
    })

    it('should not migrate when current repo versions is higher then expected', async () => {
      migrateStub.resolves()
      repoVersionStub.value(8)

      await repo.version.set(9)
      await repo.close()

      expect(migrateStub.called).to.be.false()

      try {
        await repo.open()
        throw Error('Should throw error')
      } catch (e) {
        expect(migrateStub.called).to.be.false()
        expect(e.code).to.equal(errors.InvalidRepoVersionError.code)
      }

      expect(migrateStub.called).to.be.false()
    })
  })
}
