/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')

const migrator = require('../src')
const migrations = require('./test-migrations')
const { VERSION_KEY, CONFIG_KEY } = require('../src/utils')
const { initRepo } = require('./fixtures/repo')

/**
 * @param {import('./types').SetupFunction} setup
 * @param {import('./types').CleanupFunction} cleanup
 */
module.exports = (setup, cleanup) => {
  /** @type {string} */
  let dir
  /** @type {import('../src/types').Backends} */
  let backends
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

  beforeEach(async () => {
    ({ dir, backends } = await setup())
    await initRepo(backends)
  })

  afterEach(() => cleanup(dir))

  it('migrate forward', async () => {
    await migrator.migrate(dir, backends, repoOptions, migrator.getLatestMigrationVersion(migrations), {
      migrations: migrations,
      onProgress: () => {}
    })

    const store = backends.root
    await store.open()
    const version = await store.get(VERSION_KEY)
    expect(version.toString()).to.be.equal('2')

    const config = await store.get(CONFIG_KEY)
    expect(config.toString()).to.include(migrations[0].newApiAddr)

    await store.close()
  })

  it('revert', async () => {
    await migrator.migrate(dir, backends, repoOptions, migrator.getLatestMigrationVersion(migrations), {
      migrations: migrations,
      onProgress: () => {}
    })

    await migrator.revert(dir, backends, repoOptions, 1, {
      migrations: migrations,
      onProgress: () => {}
    })

    const store = backends.root
    await store.open()
    const version = await store.get(VERSION_KEY)
    expect(version.toString()).to.be.equal('1')

    const config = await store.get(CONFIG_KEY)
    expect(config.toString()).to.not.include(migrations[0].newApiAddr)

    await store.close()
  })
}
