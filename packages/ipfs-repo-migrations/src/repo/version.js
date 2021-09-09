'use strict'

const repoInit = require('./init')
const { MissingRepoOptionsError, NotInitializedRepoError } = require('../errors')
const { VERSION_KEY } = require('../utils')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')
const { toString: uint8ArrayToString } = require('uint8arrays/to-string')

/**
 * Function that has responsibility to retrieve version of repo from its root datastore's instance.
 * This function needs to be cross-repo-version functional to be able to fetch any version number,
 * even in case of change of repo's versioning.
 *
 * @param {import('../types').Backends} backends
 */
async function getVersion (backends) {
  if (!(await repoInit.isRepoInitialized(backends))) {
    throw new NotInitializedRepoError('Repo is not initialized!')
  }

  const store = backends.root
  await store.open()

  try {
    return parseInt(uint8ArrayToString(await store.get(VERSION_KEY)))
  } finally {
    await store.close()
  }
}

/**
 * Function for setting a version in cross-repo-version manner.
 *
 * @param {number} version
 * @param {import('../types').Backends} backends
 */
async function setVersion (version, backends) {
  if (!backends) {
    throw new MissingRepoOptionsError('Please pass repo options when trying to open a repo')
  }

  const store = backends.root
  await store.open()
  await store.put(VERSION_KEY, uint8ArrayFromString(String(version)))
  await store.close()
}

module.exports = {
  getVersion,
  setVersion
}
