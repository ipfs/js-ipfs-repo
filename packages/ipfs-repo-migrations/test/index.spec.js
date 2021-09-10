/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { MemoryBlockstore } from 'blockstore-core/memory'
import { MemoryDatastore } from 'datastore-core/memory'
import * as migrator from '../src/index.js'
import {
  RequiredParameterError,
  InvalidValueError,
  NonReversibleMigrationError
} from '../src/errors.js'
import { VERSION_KEY, CONFIG_KEY } from '../src/utils.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

/**
 * @typedef {import('../src/types').Migration} Migration
 * @typedef {import('../src/types').MigrationOptions} MigrationOptions
 * @typedef {import('../src/types').RepoOptions} RepoOptions
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

function createBackends () {
  return {
    root: new MemoryDatastore(),
    blocks: new MemoryBlockstore(),
    datastore: new MemoryDatastore(),
    keys: new MemoryDatastore(),
    pins: new MemoryDatastore()
  }
}

describe('index.js', () => {
  /** @type {RepoOptions} */
  let repoOptions

  beforeEach(() => {
    let locked = false

    repoOptions = {
      repoLock: {
        locked: sinon.stub().callsFake(() => {
          return Promise.resolve(locked)
        }),
        lock: sinon.stub().callsFake(() => {
          locked = true

          return Promise.resolve({
            close: () => {
              locked = false

              return Promise.resolve()
            }
          })
        })
      },
      autoMigrate: true,
      onMigrationProgress: () => {},
      repoOwner: true
    }
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
      return expect(migrator.revert('/some/path', createBackends(), undefined, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error without toVersion argument', () => {
      const options = createOptions()

      // @ts-expect-error invalid params
      return expect(migrator.revert('/some/path', createBackends(), {}, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error with invalid toVersion argument', () => {
      const invalidValues = ['eight', '-1', '1', -1]
      const options = createOptions()

      return Promise.all(
        // @ts-expect-error invalid params
        invalidValues.map((value) => expect(migrator.revert('/some/path', createBackends(), repoOptions, value, options))
          .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code))
      )
    })

    it('should not revert if current repo version and toVersion matches', async () => {
      const options = createOptions()

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('2'))
      await backends.root.close()

      await migrator.revert('/some/path', backends, repoOptions, 2, options)

      for (const migration of options.migrations) {
        expect(migration.revert).to.have.property('called', false)
      }
    })

    it('should not revert if current repo version is lower then toVersion', async () => {
      const options = createOptions()

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('1'))
      await backends.root.close()

      await expect(migrator.revert('/some/path', backends, repoOptions, 3, options))
        .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code)

      for (const migration of options.migrations) {
        expect(migration.revert).to.have.property('called', false)
      }
    })

    it('should not allow to reverse migration that is not reversible', async () => {
      const nonReversibleMigrationsMock = createMigrations()
      // @ts-expect-error invalid params
      nonReversibleMigrationsMock[2].revert = undefined
      const options = {
        ...createOptions(),
        migrations: nonReversibleMigrationsMock
      }

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('4'))
      await backends.root.close()

      await expect(migrator.revert('/some/path', backends, repoOptions, 1, options))
        .to.eventually.be.rejectedWith(NonReversibleMigrationError).with.property('code', NonReversibleMigrationError.code)
    })

    it('should revert expected migrations', async () => {
      const options = createOptions()

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('3'))
      await backends.root.close()

      await expect(migrator.revert('/some/path', backends, repoOptions, 1, options))
        .to.eventually.be.fulfilled()

      // Checking migrations
      expect(options.migrations[3].revert).to.have.property('called', false)
      expect(options.migrations[2].revert).to.have.property('calledOnce', true)
      expect(options.migrations[1].revert).to.have.property('calledOnce', true)
      expect(options.migrations[0].revert).to.have.property('called', false)
    })

    it('should revert one migration as expected', async () => {
      const options = createOptions()

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('2'))
      await backends.root.close()

      await expect(migrator.revert('/some/path', backends, repoOptions, 1, options))
        .to.eventually.be.fulfilled()

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
      const options = {
        ...createOptions(),
        migrations: migrationsMock
      }

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('2'))
      await backends.root.close()

      await expect(migrator.revert('/some/path', backends, repoOptions, 1, options))
        .to.eventually.be.fulfilled()

      // Checking migrations
      expect(migrationsMock[0].revert).to.have.property('calledOnce', true)
    })

    it('should not have any side-effects when in dry run', async () => {
      const options = {
        ...createOptions(),
        isDryRun: true
      }

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('4'))
      await backends.root.close()

      await expect(migrator.revert('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.fulfilled()

      for (const migration of options.migrations) {
        expect(migration.revert).to.have.property('called', false)
        expect(migration.migrate).to.have.property('called', false)
      }
    })

    it('should not lock repo when ignoreLock is used', async () => {
      const options = {
        ...createOptions(),
        ignoreLock: true
      }

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('4'))
      await backends.root.close()

      await expect(migrator.revert('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.fulfilled()

      // Checking migrations
      expect(options.migrations[3].revert).to.have.property('calledOnce', true)
      expect(options.migrations[2].revert).to.have.property('calledOnce', true)
      expect(options.migrations[1].revert).to.have.property('called', false)
      expect(options.migrations[0].revert).to.have.property('called', false)

      expect(repoOptions.repoLock.lock).to.have.property('called', false)
    })

    it('should report progress when progress callback is supplied', async () => {
      const onProgressStub = sinon.stub()
      const options = {
        ...createOptions(),
        onProgress: onProgressStub
      }

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('4'))
      await backends.root.close()

      options.migrations[2].revert = async (backends, onProgress) => {
        onProgress(50, 'hello')
      }

      await expect(migrator.revert('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.fulfilled()

      expect(onProgressStub.getCall(0).calledWith(3, '50.00', 'hello')).to.be.true()
    })

    it('should unlock repo when error is thrown', async () => {
      const options = createOptions()

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('4'))
      await backends.root.close()

      options.migrations[2].revert = sinon.stub().rejects()

      await expect(migrator.revert('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.rejected()

      // The last successfully reverted migration should be set as repo's version
      await backends.root.open()
      expect(await backends.root.get(VERSION_KEY)).to.equalBytes(uint8ArrayFromString('3'))
      await backends.root.close()

      expect(repoOptions.repoLock.locked('/some/path')).to.eventually.be.false()
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
      return expect(migrator.migrate('/some/path', createBackends(), undefined, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error with out toVersion argument', () => {
      const options = createOptions()

      // @ts-expect-error invalid params
      return expect(migrator.migrate('/some/path', createBackends(), repoOptions, undefined, options))
        .to.eventually.be.rejectedWith(RequiredParameterError).with.property('code', RequiredParameterError.code)
    })

    it('should error with invalid toVersion argument', () => {
      const invalidValues = ['eight', '-1', '1', -1, {}]

      return Promise.all(
        // @ts-expect-error invalid params
        invalidValues.map((invalidValue) => expect(migrator.migrate('/some/path', createBackends(), repoOptions, invalidValue, createOptions()))
          .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code))
      )
    })

    it('should verify that all migrations are available', async () => {
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

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('1'))
      await backends.root.close()

      return expect(migrator.migrate('/some/path', backends, repoOptions, 3, options))
        .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code)
    })

    it('should verify that all migrations are available', async () => {
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

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('3'))
      await backends.root.close()

      return expect(migrator.migrate('/some/path', backends, repoOptions, 5, options))
        .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code)
    })

    it('should not migrate if current repo version and toVersion matches', async () => {
      const options = createOptions()

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('2'))
      await backends.root.close()

      await expect(migrator.migrate('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.fulfilled()

      await backends.root.open()
      expect(await backends.root.get(VERSION_KEY)).to.equalBytes(uint8ArrayFromString('2'))
      await backends.root.close()
    })

    it('should not migrate if current repo version is higher then toVersion', async () => {
      const options = createOptions()

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('3'))
      await backends.root.close()

      await expect(migrator.migrate('/some/path', backends, repoOptions, 2, options))
        .to.eventually.be.rejectedWith(InvalidValueError).with.property('code', InvalidValueError.code)

      await backends.root.open()
      expect(await backends.root.get(VERSION_KEY)).to.equalBytes(uint8ArrayFromString('3'))
      await backends.root.close()
    })

    it('should migrate expected migrations', async () => {
      const options = createOptions()

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('1'))
      await backends.root.close()

      await expect(migrator.migrate('/some/path', backends, repoOptions, 3, options))
        .to.eventually.be.fulfilled()

      // Checking migrations
      expect(options.migrations[3].migrate).to.have.property('called', false)
      expect(options.migrations[2].migrate).to.have.property('calledOnce', true)
      expect(options.migrations[1].migrate).to.have.property('calledOnce', true)
      expect(options.migrations[0].migrate).to.have.property('called', false)
    })

    it('should not have any side-effects when in dry run', async () => {
      const options = createOptions()
      options.isDryRun = true

      const backends = createBackends()
      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('2'))
      await backends.root.close()

      await expect(migrator.migrate('/some/path', backends, repoOptions, 4, options))
        .to.eventually.be.fulfilled()

      for (const migration of options.migrations) {
        expect(migration.revert).to.have.property('called', false)
        expect(migration.migrate).to.have.property('called', false)
      }
    })

    it('should not lock repo when ignoreLock is used', async () => {
      const backends = createBackends()
      const options = {
        ...createOptions(),
        ignoreLock: true
      }

      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('2'))
      await backends.root.close()

      await expect(migrator.migrate('/some/path', backends, repoOptions, 4, options))
        .to.eventually.be.fulfilled()

      // Checking migrations
      expect(options.migrations[3].migrate).to.have.property('calledOnce', true)
      expect(options.migrations[2].migrate).to.have.property('calledOnce', true)
      expect(options.migrations[1].migrate).to.have.property('called', false)
      expect(options.migrations[0].migrate).to.have.property('called', false)

      expect(repoOptions.repoLock.lock).to.have.property('called', false)
    })

    it('should report progress when progress callback is supplied', async () => {
      const onProgressStub = sinon.stub()
      const backends = createBackends()
      const options = {
        ...createOptions(),
        onProgress: onProgressStub
      }

      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('2'))
      await backends.root.close()

      options.migrations[2].migrate = async (backends, onProgress) => {
        onProgress(50, 'hello')
      }

      await expect(migrator.migrate('/some/path', backends, repoOptions, 4, options))
        .to.eventually.be.fulfilled()

      expect(onProgressStub.getCall(0).calledWith(3, '50.00', 'hello')).to.be.true()
    })

    it('should unlock repo when error is thrown', async () => {
      const backends = createBackends()
      const options = createOptions()

      await backends.root.open()
      await backends.root.put(CONFIG_KEY, uint8ArrayFromString('{}'))
      await backends.root.put(VERSION_KEY, uint8ArrayFromString('2'))
      await backends.root.close()

      options.migrations[3].migrate = sinon.stub().rejects()

      await expect(migrator.revert('/some/path', backends, repoOptions, 4, options))
        .to.eventually.be.rejected()

      // The last successfully migrated migration should be set as repo's version
      await backends.root.open()
      expect(await backends.root.get(VERSION_KEY)).to.equalBytes(uint8ArrayFromString('2'))
      await backends.root.close()

      expect(repoOptions.repoLock.locked('/some/path')).to.eventually.be.false()
    })
  })
})
