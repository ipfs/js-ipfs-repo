/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */
'use strict'

const { expect } = require('aegir/utils/chai')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

const migration = require('../../migrations/migration-8')
const Key = require('interface-datastore').Key

/**
 * @typedef {import('../../src/types').Backends} Backends
 * @typedef {import('interface-datastore').Datastore} Datastore
 */

const blocksFixtures = [
  ['AFKREIBFG77IKIKDMBDUFDCSPK7H5TE5LNPMCSXYLPML27WSTT5YA5IUNU',
    'CIQCKN76QUQUGYCHIKGFE6V6P3GJ2W26YFFPQW6YXV7NFHH3QB2RI3I'],
  ['AFKREIGKJES3Y4374YQUBLUYHT2R74JHR6VJP6RYXPYO6QB2WXIYQ32764',
    'CIQMUSJFXRZX7ZRBICXJQPHVD7YSPD5KS75DRO7Q55ADVNORRBXV75Y'],
  ['AFKREIFFFQ3AEAYMXEJO37SN5FYAF7NN7HKFMZWDXYJCULX3LW4TYHK7UY',
    'CIQKKLBWAIBQZOIS5X7E32LQAL6236OUKZTMHPQSFIXPWXNZHQOV7JQ'],
  ['AFKREIFAP4QO4GPFHESNT2X4WYPBOJU2ZKTCZ3LHJTX7TLM4DB2H6TUCL4',
    'CIQKA7ZA5YM6KOJE3HVPZNQ6C4TJVSVGFTWWOTHP7GWZYGDUP5HIEXY'],
  ['AFKREIESTIYDYOO2RIFWPQEWS5DC62D2ADDDRPFVQD7K4BSFFYGB6IFUF4',
    'CIQJFGRQHQ45VCQLM7AJNF2GF5UHUAGGHC6LLAH6VYDEKLQMD4QLILY'],
  ['AFKREIH3OGADJ2GSATMRCC42P3QEV5AWEDTKQ64Y5EHFHJJYWFUFHQ7FOU',
    'CIQPW4MAGTUNEBGZCEFZU7XAJL2BMIHGVB5ZR2IOKOSTRMLIKPB6K5I'],
  ['AFKREIEQYB5HPFOBDE2RBJUW2H67YDY6JFD476HEEJQQTFXGBHN4XF3FTA',
    'CIQJBQD2O6K4CGJVCCTJNUP57QHR4SKHZ74OIITBBGLOMCO3ZOLWLGA'],
  ['AFKREIHFQYMZMQHBUTDD7I4MKQ2LTZZNZGOSHI4R2PNV4HSC2ACSOJAWOE',
    'CIQOLBQZSZAODJGGH6RYYVBUXHTS3SM5EORZDU63LYPEFUAFE4SBM4I'],
  ['AFKREIGBTJ4X7IP5LEGNFZNUFUOPL4SG4KNZC2COF6DUAS4B3Q2FY6SWUA',
    'CIQMDGTZP6Q72WIM2LS3ILI46XZENYU3SFUE4L4HIBFYDXBULR5FNIA'],
  ['AFKREIAZ6G7XZOUM6UDNMXKDFCVNPUCN53FDEWR3NJ4NVZAWYN6I7HKXHI',
    'CIQBT4N7PS5IZ5IG2ZOUGKFK27IE33WKGJNDW2TY3LSBNQ34R6OVOOQ'],
  ['AFKREIGIHVSB2NLGZG75SIIPJQ4A6GGOXZXUPVT7YDYHAUC4CDJMALWHUA',
    'CIQMQPLEDU2WNSN73EQQ6TBYB4MM5PTPI7LH7QHQOBIFYEGSYAXMPIA'],
  ['AFKREIA6C72VFIB3TWL37LMIMZYY6YKVX72QYMAMLNMOQQHXHDJ3OT5HUY',
    'CIQB4F7VKKQDXHMXX6WYQZTRR5QVLP7VBQYAYW2Y5BAPOOGTW5H2PJQ'],
  ['AFKREIES5CPHHXCMMCKT4GF6KB6QNY6IIQKQUPW2T5XV7OB5UERLI5JH2I',
    'CIQJF2E6OPOEYYEVHYML4UD5A3R4QRAVBI7NVH3PL64D3IJCWR2SPUQ'],
  ['AFKREIGVTCG43WY2GKD44DHXV4W4XGDT42UKP7FRB6TC6R3CXSDCFHBYHU',
    'CIQNLGENZXNRUMUHZYGPPLZNZOMHHZVIU76LCD5GF5DWFPEGEKODQPI'],
  ['AFKREIHDWDCEFGH4DQKJV67UZCMW7OJEE6XEDZDETOJUZJEVTENXQUVYKU',
    'CIQOHMGEIKMPYHAUTL57JSEZN64SIJ5OIHSGJG4TJSSJLGI3PBJLQVI'],
  ['AFKREIASB5VPMAOUNYILFUXBD3LRYVOSL4YEFQRFAHSB2ESG46Q6TU6Y5Q',
    'CIQBED3K6YA5I3QQWLJOCHWXDRK5EXZQILBCKAPEDUJENZ5B5HJ5R3A'],
  ['AFKREIHS5RDRQ6TIO4QUJHK5DLKWFQEX2SKGBWCVE4SPRGMSJHPJ4CQJNE',
    'CIQPF3CHDB5GQ5ZBISOV2GWVMLAJPVEUMDMFKJZE7CMZESO6TYFAS2I'],
  ['AFKREIF2TF6KORYF3E2OSMSMQFW5CAJP6TRVIDP3ELHUTFJH2BENVSDZDE',
    'CIQLVGL4U5DQLWJU5EZEZALN2EAS75HDKQG7WIWPJGKSPUCI3LEHSGI'],
  ['AFKREIG5MWZ56SM6LQUCMGCQISWAUCEBBEHPJKZAGIA722CPF3PYG353DI',
    'CIQN2ZNT35EZ4XBIEYMFARFMBIEICCIO6SVSAMQB7VUE6LW7QNX3WGQ'],
  ['AFKREICZSSCDSBS7FFQZ55ASQDF3SMV6KLCW3GOFSZVWLYARCI47BGF354',
    'CIQFTFEEHEDF6KLBT32BFAGLXEZL4UWFNWM4LFTLMXQBCERZ6CMLX3Y']
]

/**
 * @param {*} blockstore
 * @returns {Datastore}
 */
function unwrap (blockstore) {
  if (blockstore.child) {
    return unwrap(blockstore.child)
  }

  return blockstore
}

/**
 * @param {Backends} backends
 * @param {boolean} encoded
 */
async function bootstrapBlocks (backends, encoded) {
  const store = backends.blocks
  await store.open()

  const datastore = unwrap(store)

  for (const blocksNames of blocksFixtures) {
    const name = encoded ? blocksNames[1] : blocksNames[0]

    await datastore.put(new Key(`/${name}`), uint8ArrayFromString(''))
  }

  await store.close()
}

/**
 * @param {Backends} backends
 * @param {boolean} migrated
 */
async function validateBlocks (backends, migrated) {
  const store = backends.blocks
  await store.open()

  const datastore = unwrap(store)

  for (const blockNames of blocksFixtures) {
    const newName = migrated ? blockNames[1] : blockNames[0]
    const oldName = migrated ? blockNames[0] : blockNames[1]

    const oldKey = new Key(`/${oldName}`)
    const newKey = new Key(`/${newName}`)

    expect(await datastore.has(oldKey)).to.be.false(`${oldName} was not migrated to ${newName}`)
    expect(await datastore.has(newKey)).to.be.true(`${newName} was not removed`)
  }

  await store.close()
}

/**
 * @param {import('../types').SetupFunction} setup
 * @param {import('../types').CleanupFunction} cleanup
 */
module.exports = (setup, cleanup) => {
  describe('migration 8', function () {
    this.timeout(240 * 1000)
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

    describe('empty repo', () => {
      describe('forwards', () => {
        it('should migrate pins forward', async () => {
          await migration.migrate(backends, () => {})
        })
      })

      describe('backwards', () => {
        it('should migrate pins backward', async () => {
          await migration.revert(backends, () => {})
        })
      })
    })

    it('should migrate blocks forward', async () => {
      await bootstrapBlocks(backends, false)
      await migration.migrate(backends, () => {})
      await validateBlocks(backends, true)
    })

    it('should migrate blocks backward', async () => {
      await bootstrapBlocks(backends, true)
      await migration.revert(backends, () => {})
      await validateBlocks(backends, false)
    })
  })
}
