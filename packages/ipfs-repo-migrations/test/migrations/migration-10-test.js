/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */

import { expect } from 'aegir/chai'
import { CID } from 'multiformats/cid'
import { BaseBlockstore } from 'blockstore-core/base'
import { migration } from '../../src/migrations/migration-10/index.js'
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

      await expect(store.has(key)).to.eventually.be.true(`Could not read key ${name} from blockstore`)
      expect(equals(await store.get(key), keys[name])).to.be.true(`Could not read value for key ${keys[name]} from blockstore`)
    } else {
      const key = new Key(`/${name}`)

      await expect(store.has(key)).to.eventually.be.true(`Could not read key ${name} from datastore`)
      expect(equals(await store.get(key), keys[name])).to.be.true(`Could not read value for key ${keys[name]} from datastore`)
    }
  }

  await store.close()
}

/**
 * @param {import('../types').SetupFunction} setup
 * @param {import('../types').CleanupFunction} cleanup
 */
export function test (setup, cleanup) {
  describe('migration 10', function () {
    this.timeout(1024 * 1000)

    describe('forwards', () => {
      /** @type {string} */
      let dir
      /** @type {import('../../src/types').Backends} */
      let backends
      /** @type {string} */
      let prefix

      beforeEach(async () => {
        ({ dir, prefix, backends } = await setup({
          createBackends: {
            createLevel: (path) => new Level5(path, {
              valueEncoding: 'binary'
            })
          }
        }))

        for (const backend of Object.values(backends)) {
          await bootstrap(backend)
        }
      })

      afterEach(async () => {
        if (dir != null) {
          await cleanup(dir)
        }
      })

      it('should migrate keys and values forward', async () => {
        ({ backends } = await setup({
          dir,
          prefix,
          createBackends: {
            createLevel: (path) => new Level6(path, {
              valueEncoding: 'binary'
            })
          }
        }))

        await migration.migrate(backends, () => {})

        for (const backend of Object.values(backends)) {
          await validate(backend)
        }
      })
    })

    describe('backwards using level@6.x.x', () => {
      /** @type {string} */
      let dir
      /** @type {import('../../src/types').Backends} */
      let backends
      /** @type {string} */
      let prefix

      beforeEach(async () => {
        ({ dir, prefix, backends } = await setup({
          createBackends: {
            createLevel: (path) => new Level6(path, {
              valueEncoding: 'binary'
            })
          }
        }))

        for (const backend of Object.values(backends)) {
          await bootstrap(backend)
        }
      })

      afterEach(async () => {
        if (dir != null) {
          await cleanup(dir)
        }
      })

      it('should migrate keys and values backward', async () => {
        ({ backends } = await setup({
          dir,
          prefix,
          createBackends: {
            createLevel: (path) => new Level6(path, {
              valueEncoding: 'binary'
            })
          }
        }))

        await migration.revert(backends, () => {})

        ;({ backends } = await setup({
          dir,
          prefix,
          createBackends: {
            createLevel: (path) => new Level5(path, {
              valueEncoding: 'binary'
            })
          }
        }))

        for (const backend of Object.values(backends)) {
          await validate(backend)
        }
      })
    })

    describe('backwards using level@5.x.x', () => {
      /** @type {string} */
      let dir
      /** @type {import('../../src/types').Backends} */
      let backends
      /** @type {string} */
      let prefix

      beforeEach(async () => {
        ({ dir, prefix, backends } = await setup({
          createBackends: {
            createLevel: (path) => new Level6(path, {
              valueEncoding: 'binary'
            })
          }
        }))

        for (const backend of Object.values(backends)) {
          await bootstrap(backend)
        }
      })

      afterEach(async () => {
        if (dir != null) {
          await cleanup(dir)
        }
      })

      it('should migrate keys and values backward', async () => {
        ({ backends } = await setup({
          dir,
          prefix,
          createBackends: {
            createLevel: (path) => new Level5(path, {
              valueEncoding: 'binary'
            })
          }
        }))

        await migration.revert(backends, () => {})

        ;({ backends } = await setup({
          dir,
          prefix,
          createBackends: {
            createLevel: (path) => new Level5(path, {
              valueEncoding: 'binary'
            })
          }
        }))

        for (const backend of Object.values(backends)) {
          await validate(backend)
        }
      })
    })
  })
}
