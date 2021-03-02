/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')

// @ts-ignore
const migrator = require('ipfs-repo-migrations')
const constants = require('../src/constants')
const errors = require('../src/errors')
const IPFSRepo = require('../src')
/**
 * @typedef {import("../src/index")} Repo
 */

/**
 * @param {(options? : any)=> Promise<Repo>} createTempRepo
 */
module.exports = (createTempRepo) => {
  describe('Migrations tests', () => {
    /** @type {Repo} */
    let repo
    /** @type {sinon.SinonStub<any[], any>} */
    let migrateStub
    /** @type {sinon.SinonStub<any[], any>} */
    let revertStub
    /** @type {sinon.SinonStub<any[], any>} */
    let repoVersionStub
    /** @type {sinon.SinonStub<any[], any>} */
    let getLatestMigrationVersionStub

    before(() => {
      repoVersionStub = sinon.stub(constants, 'repoVersion')
      migrateStub = sinon.stub(migrator, 'migrate')
      revertStub = sinon.stub(migrator, 'revert')
      getLatestMigrationVersionStub = sinon.stub(migrator, 'getLatestMigrationVersion')
    })

    after(() => {
      repoVersionStub.restore()
      migrateStub.restore()
      revertStub.restore()
      getLatestMigrationVersionStub.restore()
    })

    beforeEach(async () => {
      repo = await createTempRepo()
      sinon.reset()
    })

    // Testing migration logic
    const migrationLogic = [
      { config: true, option: true, result: true },
      { config: true, option: false, result: false },
      // { config: true, option: undefined, result: true },
      { config: false, option: true, result: true },
      { config: false, option: false, result: false },
      // { config: false, option: undefined, result: false },
      { config: undefined, option: true, result: true },
      { config: undefined, option: false, result: false }
      // { config: undefined, option: undefined, result: true }
    ]

    migrationLogic.forEach(({ config, option, result }) => {
      it(`should ${result ? '' : 'not '}migrate when config=${config} and option=${option}`, async () => {
        migrateStub.resolves()
        repoVersionStub.value(8)
        getLatestMigrationVersionStub.returns(9)

        if (config !== undefined) {
          await repo.config.set('repoAutoMigrate', config)
        }
        await repo.version.set(7)
        await repo.close()

        const newOpts = Object.assign({}, repo.options)
        newOpts.autoMigrate = option
        const newRepo = new IPFSRepo(repo.path, newOpts)

        expect(migrateStub.called).to.be.false()

        try {
          await newRepo.open()
          if (!result) expect.fail('should have thrown error')
        } catch (err) {
          expect(err.code).to.equal(errors.InvalidRepoVersionError.code)
        }

        expect(migrateStub.called).to.eq(result)
      })
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

    it('should migrate with progress', async () => {
      migrateStub.resolves()
      repoVersionStub.value(8)
      getLatestMigrationVersionStub.returns(9)

      await repo.version.set(7)
      await repo.close()

      expect(migrateStub.called).to.be.false()

      repo.options.onMigrationProgress = sinon.stub()

      await repo.open()

      expect(migrateStub.called).to.be.true()
      expect(migrateStub.getCall(0).args[3]).to.have.property('onProgress', repo.options.onMigrationProgress)
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

    it('should revert when current repo versions is higher then expected', async () => {
      revertStub.resolves()
      repoVersionStub.value(8)

      expect(revertStub.called).to.be.false()

      await repo.version.set(9)
      await repo.close()

      expect(migrateStub.called).to.be.false()
      expect(revertStub.called).to.be.false()

      await repo.open()

      expect(revertStub.called).to.be.true()
      expect(migrateStub.called).to.be.false()
    })

    it('should revert with progress', async () => {
      revertStub.resolves()
      repoVersionStub.value(8)

      await repo.version.set(9)
      await repo.close()

      expect(revertStub.called).to.be.false()

      repo.options.onMigrationProgress = sinon.stub()

      await repo.open()

      expect(revertStub.called).to.be.true()
      expect(revertStub.getCall(0).args[3]).to.have.property('onProgress', repo.options.onMigrationProgress)
    })
  })
}
