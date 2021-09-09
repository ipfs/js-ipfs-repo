'use strict'

/**
 * Error raised when there is lock already in place when repo is being opened.
 */
class LockExistsError extends Error {
  /**
   * @param {string} [message]
   */
  constructor (message) {
    super(message)
    this.name = 'LockExistsError'
    this.code = LockExistsError.code
  }
}

LockExistsError.code = 'ERR_LOCK_EXISTS'
exports.LockExistsError = LockExistsError

/**
 * Error raised when requested item is not found.
 */
class NotFoundError extends Error {
  /**
   * @param {string} [message]
   */
  constructor (message) {
    super(message)
    this.name = 'NotFoundError'
    this.code = NotFoundError.code
  }
}

NotFoundError.code = 'ERR_NOT_FOUND'
exports.NotFoundError = NotFoundError

/**
 * Error raised when version of the stored repo is not compatible with version of this package.
 */
class InvalidRepoVersionError extends Error {
  /**
   * @param {string} [message]
   */
  constructor (message) {
    super(message)
    this.name = 'InvalidRepoVersionError'
    this.code = InvalidRepoVersionError.code
  }
}

InvalidRepoVersionError.code = 'ERR_INVALID_REPO_VERSION'
exports.InvalidRepoVersionError = InvalidRepoVersionError

exports.ERR_REPO_NOT_INITIALIZED = 'ERR_REPO_NOT_INITIALIZED'
exports.ERR_REPO_ALREADY_OPEN = 'ERR_REPO_ALREADY_OPEN'
exports.ERR_REPO_ALREADY_CLOSED = 'ERR_REPO_ALREADY_CLOSED'
