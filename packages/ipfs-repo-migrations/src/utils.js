'use strict'

const { Key } = require('interface-datastore/key')
const { Errors } = require('datastore-core')

/**
 * @typedef {import('interface-datastore').Datastore} Datastore
 */

const CONFIG_KEY = new Key('/config')
const VERSION_KEY = new Key('/version')

/**
 * Level dbs wrap level dbs that wrap level dbs. Find a level-js
 * instance in the chain if one exists.
 *
 * @param {Datastore} store
 * @returns {Datastore | undefined}
 */
function findLevelJs (store) {
  let db = store

  // @ts-ignore
  while (db.db || db.child) {
    // @ts-ignore
    db = db.db || db.child

    // `Level` is only present in the browser, in node it is LevelDOWN
    // @ts-ignore
    if (db.type === 'level-js' || db.constructor.name === 'Level') {
      return db
    }
  }
}

/**
 * @param {Key} key
 * @param {function (Key): Promise<boolean>} has
 * @param {Datastore} store
 * @returns {Promise<boolean>}
 */
async function hasWithFallback (key, has, store) {
  const result = await has(key)

  if (result) {
    return result
  }

  // Newer versions of level.js changed the key type from Uint8Array|string
  // to Uint8Array  so fall back to trying Uint8Arrays if we are using level.js
  // and the string version of the key did not work
  const levelJs = findLevelJs(store)

  if (!levelJs) {
    return false
  }

  return new Promise((resolve, reject) => {
    // drop down to IndexDB API, otherwise level-js will monkey around with the keys/values
    // @ts-ignore
    const req = levelJs.store('readonly').get(key.toString())
    req.transaction.onabort = () => {
      reject(req.transaction.error)
    }
    req.transaction.oncomplete = () => {
      resolve(Boolean(req.result))
    }
  })
}

/**
 * @param {import('interface-datastore').Key} key
 * @param {function (Key): Promise<Uint8Array>} get
 * @param {function (Key): Promise<boolean>} has
 * @param {import('interface-datastore').Datastore} store
 * @returns {Promise<Uint8Array>}
 */
async function getWithFallback (key, get, has, store) {
  if (await has(key)) {
    return get(key)
  }

  // Newer versions of level.js changed the key type from Uint8Array|string
  // to Uint8Array so fall back to trying Uint8Arrays if we are using level.js
  // and the string version of the key did not work
  const levelJs = findLevelJs(store)

  if (!levelJs) {
    throw Errors.notFoundError()
  }

  return new Promise((resolve, reject) => {
    // drop down to IndexDB API, otherwise level-js will monkey around with the keys/values
    // @ts-ignore
    const req = levelJs.store('readonly').get(key.toString())
    req.transaction.onabort = () => {
      reject(req.transaction.error)
    }
    req.transaction.oncomplete = () => {
      if (req.result) {
        return resolve(req.result)
      }

      reject(Errors.notFoundError())
    }
  })
}

/**
 * @param {Datastore} store
 */
function wrapStore (store) {
  // necessary since level-js@5 cannot read keys from level-js@4 and earlier
  const originalGet = store.get.bind(store)
  const originalHas = store.has.bind(store)
  /**
   * @param {Key} key
   */
  store.get = (key) => getWithFallback(key, originalGet, originalHas, store)
  /**
   * @param {Key} key
   */
  store.has = (key) => hasWithFallback(key, originalHas, store)

  return store
}

/**
 * @param {import('./types').Backends} backends
 */
function wrapBackends (backends) {
  return {
    ...backends,
    root: wrapStore(backends.root),
    datastore: wrapStore(backends.datastore),
    pins: wrapStore(backends.pins),
    keys: wrapStore(backends.keys)
  }
}

module.exports = {
  wrapBackends,
  hasWithFallback,
  getWithFallback,
  findLevelJs,
  CONFIG_KEY,
  VERSION_KEY
}
