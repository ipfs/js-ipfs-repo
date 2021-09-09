/* eslint-env mocha */
'use strict'

const { LevelDatastore } = require('datastore-level')
const { S3Datastore } = require('datastore-s3')
const { ShardingDatastore } = require('datastore-core/sharding')
const { NextToLast } = require('datastore-core/shard')
const { BlockstoreDatastoreAdapter } = require('blockstore-datastore-adapter')
const mockS3 = require('./fixtures/mock-s3')
const S3 = require('aws-sdk').S3
const { createRepo } = require('./fixtures/repo')

/**
 * @typedef {import('../src/types').Backends} Backends
 */

/**
 * @param {*} dir
 * @returns {Promise<void>}
 */
async function deleteDb (dir) {
  return new Promise((resolve) => {
    const req = globalThis.indexedDB.deleteDatabase(dir)
    req.onerror = () => {
      console.error(`Could not delete ${dir}`) // eslint-disable-line no-console
      resolve()
    }
    req.onsuccess = () => {
      resolve()
    }
  })
}

/**
 * @type {import('./types').CleanupFunction}
 */
async function cleanup (dir) {
  await deleteDb(dir)
  await deleteDb('level-js-' + dir)

  for (const type of ['blocks', 'keys', 'datastore', 'pins']) {
    await deleteDb(dir + '/' + type)
    await deleteDb('level-js-' + dir + '/' + type)
  }
}

const CONFIGURATIONS = [{
  name: 'local',
  cleanup,
  /**
   * @param {string} prefix
   * @returns {import('../src/types').Backends}
   */
  createBackends: (prefix) => {
    return {
      root: new LevelDatastore(prefix, {
        version: 2
      }),
      blocks: new BlockstoreDatastoreAdapter(
        new LevelDatastore(`${prefix}/blocks`, {
          version: 2
        })
      ),
      datastore: new LevelDatastore(`${prefix}/datastore`, {
        version: 2
      }),
      keys: new LevelDatastore(`${prefix}/keys`, {
        version: 2
      }),
      pins: new LevelDatastore(`${prefix}/pins`, {
        version: 2
      })
    }
  }
}, {
  name: 'with s3',
  cleanup: async () => {},
  /**
   * @param {string} prefix
   * @returns {import('../src/types').Backends}
   */
  createBackends: (prefix) => {
    const s3Instance = new S3({
      params: {
        Bucket: 'test'
      }
    })
    mockS3(s3Instance)

    return {
      root: new S3Datastore(prefix, {
        s3: s3Instance,
        createIfMissing: false
      }),
      blocks: new BlockstoreDatastoreAdapter(
        new ShardingDatastore(
          new S3Datastore(`${prefix}/blocks`, {
            s3: s3Instance,
            createIfMissing: false
          }),
          new NextToLast(2)
        )
      ),
      datastore: new ShardingDatastore(
        new S3Datastore(`${prefix}/datastore`, {
          s3: s3Instance,
          createIfMissing: false
        }),
        new NextToLast(2)
      ),
      keys: new ShardingDatastore(
        new S3Datastore(`${prefix}/keys`, {
          s3: s3Instance,
          createIfMissing: false
        }),
        new NextToLast(2)
      ),
      pins: new ShardingDatastore(
        new S3Datastore(`${prefix}/pins`, {
          s3: s3Instance,
          createIfMissing: false
        }),
        new NextToLast(2)
      )
    }
  }
}]

CONFIGURATIONS.forEach(({ name, createBackends, cleanup }) => {
  /** @type {import('./types').SetupFunction} */
  const setup = (prefix) => createRepo(createBackends, prefix)

  describe(name, () => {
    describe('version tests', () => {
      require('./version-test')(setup, cleanup)
    })

    describe('migrations tests', () => {
      require('./migrations')(setup, cleanup)
    })

    describe('init tests', () => {
      require('./init-test')(setup, cleanup)
    })

    describe('integration tests', () => {
      require('./integration-test')(setup, cleanup)
    })
  })
})
