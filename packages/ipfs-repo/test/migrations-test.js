/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/chai'
import sinon from 'sinon'
import { InvalidRepoVersionError } from '../src/errors.js'
import { createRepo } from '../src/index.js'
import { repoVersion } from '../src/constants.js'
import { migrations } from 'ipfs-repo-migrations'

/**
 * @typedef {import('../src/types').IPFSRepo} IPFSRepo
 * @typedef {import('../src/types').Options} Options
 */

/**
 * @param {(options?: Partial<Options>)=> Promise<IPFSRepo>} createTempRepo
 */
export default (createTempRepo) => {
  describe('Migrations tests', () => {
    /** @type {IPFSRepo} */
    let repo

    beforeEach(async () => {
      repo = await createTempRepo()
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
        if (config !== undefined) {
          await repo.config.set('repoAutoMigrate', config)
        }
        await repo.version.set(repoVersion - 1)
        await repo.close()

        // @ts-expect-error options is a private field
        const newOpts = Object.assign({}, repo.options)
        newOpts.autoMigrate = option
        // @ts-expect-error loadCodec is a private field
        const newRepo = createRepo(repo.path, repo.pins.loadCodec, {
          // @ts-expect-error blockstore is a private field
          blocks: repo.pins.blockstore,
          datastore: repo.datastore,
          root: repo.root,
          keys: repo.keys,
          // @ts-expect-error pinstore is a private field
          pins: repo.pins.pinstore
        }, newOpts)

        const p = newRepo.open()

        if (!result) {
          await expect(p).to.eventually.be.rejected().with.property('code', InvalidRepoVersionError.code)
        } else {
          await p
        }

        await expect(repo.version.get()).to.eventually.equal(result ? repoVersion : repoVersion - 1)
      })
    })

    it('should migrate by default', async () => {
      await repo.version.set(repoVersion - 1)
      await repo.close()

      await repo.open()

      await expect(repo.version.get()).to.eventually.equal(repoVersion)
    })

    it('should migrate with progress', async () => {
      await repo.version.set(repoVersion - 1)
      await repo.close()

      // @ts-expect-error options is a private field
      repo.options.onMigrationProgress = sinon.stub()

      await repo.open()

      // @ts-expect-error options is a private field
      expect(repo.options.onMigrationProgress.called).to.be.true()

      await expect(repo.version.get()).to.eventually.equal(repoVersion)
    })

    it('should not migrate when versions matches', async () => {
      await repo.version.set(repoVersion)

      await repo.close()
      await repo.open()

      await expect(repo.version.get()).to.eventually.equal(repoVersion)
    })

    it('should revert when current repo versions is higher then expected', async () => {
      migrations.push({
        version: repoVersion + 1,
        description: '',
        migrate: async (backends, progress) => {
          progress(100, 'done')
        },
        revert: async (backends, progress) => {
          progress(100, 'done')
        }
      })

      await repo.version.set(repoVersion + 1)
      await repo.close()

      await repo.open()

      await expect(repo.version.get()).to.eventually.equal(repoVersion)

      migrations.pop()
    })

    it('should revert with progress', async () => {
      migrations.push({
        version: repoVersion + 1,
        description: '',
        migrate: async (backends, progress) => {
          progress(100, 'done')
        },
        revert: async (backends, progress) => {
          progress(100, 'done')
        }
      })

      await repo.version.set(repoVersion + 1)
      await repo.close()

      // @ts-expect-error options is a private field
      repo.options.onMigrationProgress = sinon.stub()

      await repo.open()

      // @ts-expect-error options is a private field
      expect(repo.options.onMigrationProgress.called).to.be.true()

      migrations.pop()
    })
  })
}
