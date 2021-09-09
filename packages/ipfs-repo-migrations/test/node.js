/* eslint-env mocha */
'use strict'

const os = require('os')
const rimraf = require('rimraf')
const { FsDatastore } = require('datastore-fs')
const { LevelDatastore } = require('datastore-level')
const { S3Datastore } = require('datastore-s3')
const { ShardingDatastore } = require('datastore-core/sharding')
const { NextToLast } = require('datastore-core/shard')
const { BlockstoreDatastoreAdapter } = require('blockstore-datastore-adapter')
const mockS3 = require('./fixtures/mock-s3')
const S3 = require('aws-sdk').S3
const { createRepo } = require('./fixtures/repo')

/**
 * @param {string} dir
 */
async function cleanup (dir) {
  await rimraf.sync(dir)
}

const CONFIGURATIONS = [{
  name: 'with sharding',
  cleanup,
  /**
   * @param {string} prefix
   * @returns {import('../src/types').Backends}
   */
  createBackends: (prefix) => {
    return {
      root: new FsDatastore(prefix),
      blocks: new BlockstoreDatastoreAdapter(
        new ShardingDatastore(
          new FsDatastore(`${prefix}/blocks`, {
            extension: '.data'
          }),
          new NextToLast(2))
      ),
      datastore: new LevelDatastore(`${prefix}/datastore`),
      keys: new FsDatastore(`${prefix}/keys`),
      pins: new LevelDatastore(`${prefix}/pins`)
    }
  }
}, {
  name: 'without sharding',
  cleanup,
  /**
   * @param {string} prefix
   * @returns {import('../src/types').Backends}
   */
  createBackends: (prefix) => {
    return {
      root: new FsDatastore(prefix),
      blocks: new BlockstoreDatastoreAdapter(
        new FsDatastore(`${prefix}/blocks`, {
          extension: '.data'
        })
      ),
      datastore: new LevelDatastore(`${prefix}/datastore`),
      keys: new FsDatastore(`${prefix}/keys`),
      pins: new LevelDatastore(`${prefix}/pins`)
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
      datastore: new ShardingDatastore(new S3Datastore(`${prefix}/datastore`, {
        s3: s3Instance,
        createIfMissing: false
      }), new NextToLast(2)),
      keys: new ShardingDatastore(new S3Datastore(`${prefix}/keys`, {
        s3: s3Instance,
        createIfMissing: false
      }), new NextToLast(2)),
      pins: new ShardingDatastore(new S3Datastore(`${prefix}/pins`, {
        s3: s3Instance,
        createIfMissing: false
      }), new NextToLast(2))
    }
  }
}]

CONFIGURATIONS.forEach(({ name, createBackends, cleanup }) => {
  const setup = () => createRepo(createBackends, os.tmpdir())

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
