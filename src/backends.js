'use strict'

/**
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('./types').Backends} Backends
 * @typedef {Required<import('./types').Options>} Options
 */

/**
 *
 * @param {Backends} name
 * @param {string} path
 * @param {Options} options
 * @returns {Datastore}
 */
function createBackend (name, path, options) {
  const Ctor = options.storageBackends[name]
  const backendOptions = Object.assign({}, options.storageBackendOptions[name] || {})
  // @ts-ignore we don't have a signature for the constructor
  return new Ctor(path, backendOptions)
}

module.exports = {
  create: createBackend
}
