/* eslint-env mocha */

import os from 'os'
import rimraf from 'rimraf'
import { FsDatastore } from 'datastore-fs'
import { LevelDatastore } from 'datastore-level'
import { S3Datastore } from 'datastore-s3'
import { ShardingDatastore } from 'datastore-core/sharding'
import { NextToLast } from 'datastore-core/shard'
import { BlockstoreDatastoreAdapter } from 'blockstore-datastore-adapter'
import { mockS3 } from './fixtures/mock-s3.js'
import S3 from 'aws-sdk/clients/s3.js'
import { createRepo } from './fixtures/repo.js'
import { test as versionTests } from './version-test.js'
import { test as migrationTests } from './migrations/index.js'
import { test as initTests } from './init-test.js'
import { test as integrationTests } from './integration-test.js'

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
      versionTests(setup, cleanup)
    })

    describe('migrations tests', () => {
      migrationTests(setup, cleanup)
    })

    describe('init tests', () => {
      initTests(setup, cleanup)
    })

    describe('integration tests', () => {
      integrationTests(setup, cleanup)
    })
  })
})
