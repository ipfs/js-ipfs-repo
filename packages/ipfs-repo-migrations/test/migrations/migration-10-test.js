/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */

import { expect } from 'aegir/utils/chai.js'
import { CID } from 'multiformats/cid'
import { BaseBlockstore } from 'blockstore-core/base'
import { migration } from '../../migrations/migration-10/index.js'
import { Key } from 'interface-datastore/key'
import { fromString } from 'uint8arrays/from-string'
import { equals } from 'uint8arrays/equals'
// @ts-expect-error no types
import Level5 from 'level-5'
// @ts-expect-error no types
import Level6 from 'level-6'

/**
 * @typedef {import('../../src/types').Backends} Backends
 * @typedef {import('interface-datastore').Datastore} Datastore
 */

/**
 * @type {Record<string, Uint8Array>}
 */
const keys = {
  CIQCKN76QUQUGYCHIKGFE6V6P3GJ2W26YFFPQW6YXV7NFHH3QB2RI3I: fromString('hello'),
  CIQKKLBWAIBQZOIS5X7E32LQAL6236OUKZTMHPQSFIXPWXNZHQOV7JQ: fromString('derp')
}

/**
 * @param {Datastore} store
 */
async function bootstrap (store) {
  await store.open()

  for (const name of Object.keys(keys)) {
    if (store instanceof BaseBlockstore) {
      await store.put(CID.parse(`b${name.toLowerCase()}`), keys[name])
    } else {
      await store.put(new Key(name), keys[name])
    }
  }

  await store.close()
}

/**
 * @param {Datastore} store
 */
async function validate (store) {
  await store.open()

  for (const name of Object.keys(keys)) {
    if (store instanceof BaseBlockstore) {
      const key = CID.parse(`b${name.toLowerCase()}`)

      expect(await store.has(key)).to.be.true(`Could not read key ${name}`)
      expect(equals(await store.get(key), keys[name])).to.be.true(`Could not read value for key ${keys[name]}`)
    } else {
      const key = new Key(`/${name}`)

      await expect(store.has(key)).to.eventually.be.true(`Could not read key ${name}`)
      expect(equals(await store.get(key), keys[name])).to.be.true(`Could not read value for key ${keys[name]}`)
    }
  }

  await store.close()
}

/**
 * @param {Backends} backends
 * @param {*} LevelImpl
 * @returns {Backends}
 */
function withLevels (backends, LevelImpl) {
  const output = {
    ...backends
  }

  Object.entries(backends)
    .forEach(([key, value]) => {
      // @ts-ignore it's ok
      output[key] = withLevel(value, LevelImpl)
    })

  return output
}

/**
 * @param {Datastore} store
 * @param {*} LevelImpl
 */
function withLevel (store, LevelImpl) {
  let parent = {
    child: store
  }

  while (parent.child) {
    if (parent.child.constructor.name === 'LevelDatastore') {
      // @ts-ignore undocumented properties
      parent.child.database = LevelImpl
      // @ts-ignore undocumented properties
      delete parent.child.db

      return store
    }

    // @ts-ignore undocumented properties
    parent = parent.child
  }

  return store
}

/**
 * @param {import('../types').SetupFunction} setup
 * @param {import('../types').CleanupFunction} cleanup
 */
export function test (setup, cleanup) {
  describe('migration 10', function () {
    this.timeout(1024 * 1000)
    /** @type {string} */
    let dir
    /** @type {import('../../src/types').Backends} */
    let backends

    beforeEach(async () => {
      ({ dir, backends } = await setup())
    })

    afterEach(async () => {
      await cleanup(dir)
    })

    describe('forwards', () => {
      beforeEach(async () => {
        for (const backend of Object.values(backends)) {
          await bootstrap(withLevel(backend, Level5))
        }
      })

      it('should migrate keys and values forward', async () => {
        await migration.migrate(withLevels(backends, Level6), () => {})

        for (const backend of Object.values(backends)) {
          await validate(withLevel(backend, Level6))
        }
      })
    })

    describe('backwards using level@6.x.x', () => {
      beforeEach(async () => {
        for (const backend of Object.values(backends)) {
          await bootstrap(withLevel(backend, Level6))
        }
      })

      it('should migrate keys and values backward', async () => {
        await migration.revert(withLevels(backends, Level6), () => {})

        for (const backend of Object.values(backends)) {
          await validate(withLevel(backend, Level5))
        }
      })
    })

    describe('backwards using level@5.x.x', () => {
      beforeEach(async () => {
        for (const backend of Object.values(backends)) {
          await bootstrap(withLevel(backend, Level6))
        }
      })

      it('should migrate keys and values backward', async () => {
        await migration.revert(withLevels(backends, Level5), () => {})

        for (const backend of Object.values(backends)) {
          await validate(withLevel(backend, Level5))
        }
      })
    })
  })
}
