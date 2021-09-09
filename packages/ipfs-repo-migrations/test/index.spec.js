/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { MemoryBlockstore } from 'blockstore-core/memory'
import { MemoryDatastore } from 'datastore-core/memory'
import * as migrator from '../src/index.js'
import * as repoVersion from '../src/repo/version.js'
import * as repoInit from '../src/repo/init.js'
import {
  RequiredParameterError,
  InvalidValueError,
  NonReversibleMigrationError
} from '../src/errors.js'

/**
 * @typedef {import('../src/types').Migration} Migration
 * @typedef {import('../src/types').MigrationOptions} MigrationOptions
 */

/**
 * @returns {Migration[]}
 */
function createMigrations () {
  return [
    {
      version: 1,
      description: '',
      migrate: sinon.stub().resolves(),
      revert: sinon.stub().resolves()
    },
    {
      version: 2,
      description: '',
      migrate: sinon.stub().resolves(),
      revert: sinon.stub().resolves()
    },
    {
      version: 3,
      description: '',
      migrate: sinon.stub().resolves(),
      revert: sinon.stub().resolves()
    },
    {
      version: 4,
      description: '',
      migrate: sinon.stub().resolves(),
      revert: sinon.stub().resolves()
    }
  ]
}

/**
 * @returns {Required<MigrationOptions>}
 */
function createOptions () {
  return {
    ignoreLock: false,
    isDryRun: false,
    onProgress: () => {},
    migrations: createMigrations()
  }
}

describe('index.js', () => {
  /**
   * @type {import('sinon').SinonStub}
   */
  let getVersionStub
  /**
   * @type {import('sinon').SinonStub}
   */
  let setVersionStub
  /**
   * @type {import('sinon').SinonStub}
   */
  let lockStub
  /**
   * @type {import('sinon').SinonStub}
   */
  let initStub
  /**
   * @type {import('sinon').SinonStub}
   */
  let lockCloseStub
  const repoOptions = {
    repoLock: {
      locked: () => Promise.resolve(false),
      lock: () => Promise.resolve({
        close: () => Promise.resolve()
      })
    },
    autoMigrate: true,
    onMigrationProgress: () => {},
    repoOwner: true
  }

  const backends = {
    root: new MemoryDatastore(),
    blocks: new MemoryBlockstore(),
    datastore: new MemoryDatastore(),
    keys: new MemoryDatastore(),
    pins: new MemoryDatastore()
  }

  beforeEach(() => {
    // Reset all stubs
    sinon.reset()

    initStub.resolves(true)
    lockCloseStub.resolves()
    lockStub.resolves({ close: lockCloseStub })
  })

  before(() => {
    getVersionStub = sinon.stub(repoVersion, 'getVersion')
    setVersionStub = sinon.stub(repoVersion, 'setVersion')
    lockCloseStub = sinon.stub()
    lockStub = sinon.stub(repoOptions.repoLock, 'lock')
    initStub = sinon.stub(repoInit, 'isRepoInitialized')
  })

  after(() => {
    getVersionStub.restore()
    setVersionStub.restore()
    lockStub.restore()
    initStub.restore()
  })

  it('get version of the latest migration', () => {
    const migrationsMock = createMigrations()

    expect(migrator.getLatestMigrationVersion(migrationsMock)).to.equal(4)
    expect(migrator.getLatestMigrationVersion([])).to.equal(0)
  })

  describe('revert', () => {
    it('should error with out path argument', () => {
      const options = createOptions()

      // @ts-expect-error invalid params
      return expect(migrator.revert(undefined, undefined, undefined, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error without backends argument', () => {
      const options = createOptions()

      // @ts-expect-error invalid params
      return expect(migrator.revert('/some/path', undefined, undefined, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error without repo options argument', () => {
      const options = createOptions()

      // @ts-expect-error invalid params
      return expect(migrator.revert('/some/path', backends, undefined, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error without toVersion argument', () => {
      const options = createOptions()

      // @ts-expect-error invalid params
      return expect(migrator.revert('/some/path', backends, {}, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error with invalid toVersion argument', () => {
      const invalidValues = ['eight', '-1', '1', -1]
      const options = createOptions()

      return Promise.all(
        // @ts-expect-error invalid params
        invalidValues.map((value) => expect(migrator.revert('/some/path', backends, repoOptions, value, options))
          .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code))
      )
    })

    it('should not revert if current repo version and toVersion matches', async () => {
      getVersionStub.returns(2)
      const options = createOptions()

      await expect(migrator.revert('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.fulfilled()

      expect(lockStub).to.have.property('called', false)
    })

    it('should not revert if current repo version is lower then toVersion', async () => {
      getVersionStub.returns(2)
      const options = createOptions()

      await expect(migrator.revert('/some/path', backends, repoOptions, 3, options))
        .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code)

      expect(lockStub).to.have.property('called', false)
    })

    it('should not allow to reverse migration that is not reversible', () => {
      const nonReversibleMigrationsMock = createMigrations()
      // @ts-expect-error invalid params
      nonReversibleMigrationsMock[2].revert = undefined
      const options = { migrations: nonReversibleMigrationsMock }

      getVersionStub.returns(4)
      return expect(
        migrator.revert('/some/path', backends, repoOptions, 1, options)
      ).to.eventually.be.rejectedWith(NonReversibleMigrationError)
        .with.property('code', NonReversibleMigrationError.code)
    })

    it('should revert expected migrations', async () => {
      const options = createOptions()
      getVersionStub.returns(3)

      await expect(migrator.revert('/some/path', backends, repoOptions, 1, options))
        .to.eventually.be.fulfilled()

      expect(lockCloseStub).to.have.property('calledOnce', true)
      expect(lockStub).to.have.property('calledOnce', true)
      expect(setVersionStub.calledOnceWith(1, backends)).to.be.true()

      // Checking migrations
      expect(options.migrations[3].revert).to.have.property('called', false)
      expect(options.migrations[2].revert).to.have.property('calledOnce', true)
      expect(options.migrations[1].revert).to.have.property('calledOnce', true)
      expect(options.migrations[0].revert).to.have.property('called', false)
    })

    it('should revert one migration as expected', async () => {
      const options = createOptions()
      getVersionStub.returns(2)

      await expect(migrator.revert('/some/path', backends, repoOptions, 1, options))
        .to.eventually.be.fulfilled()

      expect(lockCloseStub).to.have.property('calledOnce', true)
      expect(lockStub).to.have.property('calledOnce', true)
      expect(setVersionStub.calledOnceWith(1, backends)).to.be.true()

      // Checking migrations
      expect(options.migrations[3].revert).to.have.property('called', false)
      expect(options.migrations[2].revert).to.have.property('called', false)
      expect(options.migrations[1].revert).to.have.property('calledOnce', true)
      expect(options.migrations[0].revert).to.have.property('called', false)
    })

    it('should reversion with one migration', async () => {
      const migrationsMock = [
        {
          version: 2,
          description: '',
          reversible: true,
          migrate: sinon.stub().resolves(),
          revert: sinon.stub().resolves()
        }
      ]
      const options = { migrations: migrationsMock }
      getVersionStub.returns(2)

      await expect(migrator.revert('/some/path', backends, repoOptions, 1, options))
        .to.eventually.be.fulfilled()

      expect(lockCloseStub).to.have.property('calledOnce', true)
      expect(lockStub).to.have.property('calledOnce', true)
      expect(setVersionStub.calledOnceWith(1, backends)).to.be.true()

      // Checking migrations
      expect(migrationsMock[0].revert).to.have.property('calledOnce', true)
    })

    it('should not have any side-effects when in dry run', async () => {
      const options = createOptions()
      getVersionStub.returns(4)
      options.isDryRun = true

      await expect(migrator.revert('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.fulfilled()

      expect(lockCloseStub).to.have.property('called', false)
      expect(lockStub).to.have.property('called', false)
      expect(setVersionStub).to.have.property('called', false)

      return options.migrations.forEach(({ revert }) => expect(revert).to.have.property('calledOnce', false))
    })

    it('should not lock repo when ignoreLock is used', async () => {
      const options = createOptions()
      options.ignoreLock = true

      getVersionStub.returns(4)

      await expect(migrator.revert('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.fulfilled()

      expect(lockCloseStub).to.have.property('called', false)
      expect(lockStub).to.have.property('called', false)
      expect(setVersionStub.calledOnceWith(2, backends)).to.be.true()

      // Checking migrations
      expect(options.migrations[3].revert).to.have.property('calledOnce', true)
      expect(options.migrations[2].revert).to.have.property('calledOnce', true)
      expect(options.migrations[1].revert).to.have.property('called', false)
      expect(options.migrations[0].revert).to.have.property('called', false)
    })

    it('should report progress when progress callback is supplied', async () => {
      const options = createOptions()
      const onProgressStub = sinon.stub()
      options.onProgress = onProgressStub
      getVersionStub.returns(4)

      options.migrations[2].revert = async (backends, onProgress) => {
        onProgress(50, 'hello')
      }

      await expect(migrator.revert('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.fulfilled()

      expect(onProgressStub.getCall(0).calledWith(3, '50.00', 'hello')).to.be.true()
    })

    it('should unlock repo when error is thrown', async () => {
      getVersionStub.returns(4)
      const options = createOptions()
      options.migrations[2].revert = sinon.stub().rejects()

      await expect(migrator.revert('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.rejected()

      expect(lockCloseStub).to.have.property('calledOnce', true)
      expect(lockStub).to.have.property('calledOnce', true)

      // The last successfully reverted migration should be set as repo's version
      expect(setVersionStub.calledOnceWith(3, backends)).to.be.true()
    })
  })

  describe('migrate', () => {
    it('should error with out path argument', () => {
      const options = createOptions()

      // @ts-expect-error invalid params
      return expect(migrator.migrate(undefined, undefined, undefined, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error with out backends argument', () => {
      const options = createOptions()

      // @ts-expect-error invalid params
      return expect(migrator.migrate('/some/path', undefined, undefined, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error with out repoOptions argument', () => {
      const options = createOptions()

      // @ts-expect-error invalid params
      return expect(migrator.migrate('/some/path', backends, undefined, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error with out toVersion argument', () => {
      const options = createOptions()

      // @ts-expect-error invalid params
      return expect(migrator.migrate('/some/path', backends, repoOptions, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error with invalid toVersion argument', () => {
      const invalidValues = ['eight', '-1', '1', -1, {}]

      return Promise.all(
        // @ts-expect-error invalid params
        invalidValues.map((invalidValue) => expect(migrator.migrate('/some/path', backends, repoOptions, invalidValue, createOptions()))
          .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code))
      )
    })

    it('should verify that all migrations are available', () => {
      const options = {
        migrations: [
          {
            version: 3,
            description: '',
            migrate: sinon.stub().resolves(),
            revert: sinon.stub().resolves()
          },
          {
            version: 4,
            description: '',
            migrate: sinon.stub().resolves(),
            revert: sinon.stub().resolves()
          }
        ]
      }

      getVersionStub.returns(1)

      return expect(migrator.migrate('/some/path', backends, repoOptions, 3, options))
        .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code)
    })

    it('should verify that all migrations are available', () => {
      const options = {
        migrations: [
          {
            version: 3,
            description: '',
            migrate: sinon.stub().resolves(),
            revert: sinon.stub().resolves()
          },
          {
            version: 4,
            description: '',
            migrate: sinon.stub().resolves(),
            revert: sinon.stub().resolves()
          }
        ]
      }

      getVersionStub.returns(3)

      return expect(migrator.migrate('/some/path', backends, repoOptions, 5, options))
        .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code)
    })

    it('should not migrate if current repo version and toVersion matches', async () => {
      getVersionStub.returns(2)
      const options = createOptions()

      await expect(migrator.migrate('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.fulfilled()

      expect(lockStub).to.have.property('called', false)
    })

    it('should not migrate if current repo version is higher then toVersion', async () => {
      getVersionStub.returns(3)
      const options = createOptions()

      await expect(migrator.migrate('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code)

      expect(lockStub).to.have.property('called', false)
    })

    it('should migrate expected migrations', async () => {
      const options = createOptions()
      getVersionStub.returns(1)

      await expect(migrator.migrate('/some/path', backends, repoOptions, 3, options))
        .to.eventually.be.fulfilled()

      expect(lockCloseStub).to.have.property('calledOnce', true)
      expect(lockStub).to.have.property('calledOnce', true)
      expect(setVersionStub.calledOnceWith(3, backends)).to.be.true()

      // Checking migrations
      expect(options.migrations[3].migrate).to.have.property('called', false)
      expect(options.migrations[2].migrate).to.have.property('calledOnce', true)
      expect(options.migrations[1].migrate).to.have.property('calledOnce', true)
      expect(options.migrations[0].migrate).to.have.property('called', false)
    })

    it('should not have any side-effects when in dry run', async () => {
      const options = createOptions()
      options.isDryRun = true
      getVersionStub.returns(2)

      await expect(migrator.migrate('/some/path', backends, repoOptions, 4, options))
        .to.eventually.be.fulfilled()

      expect(lockCloseStub).to.have.property('called', false)
      expect(lockStub).to.have.property('called', false)
      expect(setVersionStub).to.have.property('called', false)

      return options.migrations.forEach(({ migrate }) => expect(migrate).to.have.property('calledOnce', false))
    })

    it('should not lock repo when ignoreLock is used', async () => {
      const options = createOptions()
      options.ignoreLock = true
      getVersionStub.returns(2)

      await expect(migrator.migrate('/some/path', backends, repoOptions, 4, options))
        .to.eventually.be.fulfilled()

      expect(lockCloseStub).to.have.property('called', false)
      expect(lockStub).to.have.property('called', false)
      expect(setVersionStub.calledOnceWith(4, backends)).to.be.true()

      // Checking migrations
      expect(options.migrations[3].migrate).to.have.property('calledOnce', true)
      expect(options.migrations[2].migrate).to.have.property('calledOnce', true)
      expect(options.migrations[1].migrate).to.have.property('called', false)
      expect(options.migrations[0].migrate).to.have.property('called', false)
    })

    it('should report progress when progress callback is supplied', async () => {
      const options = createOptions()
      const onProgressStub = sinon.stub()
      options.onProgress = onProgressStub
      getVersionStub.returns(2)

      options.migrations[2].migrate = async (backends, onProgress) => {
        onProgress(50, 'hello')
      }

      await expect(migrator.migrate('/some/path', backends, repoOptions, 4, options))
        .to.eventually.be.fulfilled()

      expect(onProgressStub.getCall(0).calledWith(3, '50.00', 'hello')).to.be.true()
    })

    it('should unlock repo when error is thrown', async () => {
      getVersionStub.returns(2)
      const options = createOptions()
      options.migrations[3].migrate = sinon.stub().rejects()

      await expect(migrator.migrate('/some/path', backends, repoOptions, 4, options))
        .to.eventually.be.rejected()

      expect(lockCloseStub).to.have.property('calledOnce', true)
      expect(lockStub).to.have.property('calledOnce', true)

      // The last successfully migrated migration should be set as repo's version
      expect(setVersionStub.calledOnceWith(3, backends)).to.be.true()
    })
  })
})
