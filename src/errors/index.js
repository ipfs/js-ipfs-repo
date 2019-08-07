'use strict'

// TODO: Should be refactored when https://github.com/ipfs/js-ipfs/pull/1746/ is adopted.

/**
 * Error raised when there is lock already in place when repo is being opened.
 */
class LockExistsError extends Error {
  constructor (message) {
    super(message)
    this.name = 'LockExistsError'
    this.code = 'ERR_LOCK_EXISTS'
    this.message = message
  }
}

LockExistsError.code = 'ERR_LOCK_EXISTS'
exports.ERR_LOCK_EXISTS = LockExistsError

/**
 * Error raised when requested item is not found.
 */
class NotFoundError extends Error {
  constructor (message) {
    super(message)
    this.name = 'NotFoundError'
    this.code = 'ERR_NOT_FOUND'
    this.message = message
  }
}

NotFoundError.code = 'ERR_NOT_FOUND'
exports.ERR_NOT_FOUND = NotFoundError

/**
 * Error raised when repo was not initialized.
 */
class RepoNotInitializedError extends Error {
  constructor (message, path) {
    super(message)
    this.name = 'RepoNotInitializedError'
    this.code = 'ERR_REPO_NOT_INITIALIZED'
    this.message = message
    this.path = path
  }
}

RepoNotInitializedError.code = 'ERR_REPO_NOT_INITIALIZED'
exports.ERR_REPO_NOT_INITIALIZED = RepoNotInitializedError

/**
 * Error raised while opening repo when repo is already opened.
 */
class RepoAlreadyOpenError extends Error {
  constructor (message) {
    super(message)
    this.name = 'RepoAlreadyOpenError'
    this.code = 'ERR_REPO_ALREADY_OPEN'
    this.message = message
  }
}

RepoAlreadyOpenError.code = 'ERR_REPO_ALREADY_OPEN'
exports.ERR_REPO_ALREADY_OPEN = RepoAlreadyOpenError

/**
 * Error raised while opening repo when repo is already opened.
 */
class RepoAlreadyClosedError extends Error {
  constructor (message) {
    super(message)
    this.name = 'RepoAlreadyClosedError'
    this.code = 'ERR_REPO_ALREADY_CLOSED'
    this.message = message
  }
}

RepoAlreadyClosedError.code = 'ERR_REPO_ALREADY_CLOSED'
exports.ERR_REPO_ALREADY_CLOSED = RepoAlreadyClosedError

/**
 * Error raised when lock object is returned that does not have close() function.
 */
class NoCloseFunctionError extends Error {
  constructor (message) {
    super(message)
    this.name = 'NoCloseFunctionError'
    this.code = 'ERR_NO_CLOSE_FUNCTION'
    this.message = message
  }
}

NoCloseFunctionError.code = 'ERR_NO_CLOSE_FUNCTION'
exports.ERR_NO_CLOSE_FUNCTION = NoCloseFunctionError

/**
 * Error raised when the version of repo is not as expected.
 */
class InvalidRepoVersionError extends Error {
  constructor (message) {
    super(message)
    this.name = 'InvalidRepoVersionError'
    this.code = 'ERR_INVALID_REPO_VERSION'
    this.message = message
  }
}

InvalidRepoVersionError.code = 'ERR_INVALID_REPO_VERSION'
exports.ERR_INVALID_REPO_VERSION = InvalidRepoVersionError

/**
 * Error raised when the config's key is of invalid type.
 */
class InvalidKeyError extends Error {
  constructor (message) {
    super(message)
    this.name = 'InvalidKeyError'
    this.code = 'ERR_INVALID_KEY'
    this.message = message
  }
}

InvalidKeyError.code = 'ERR_INVALID_KEY'
exports.ERR_INVALID_KEY = InvalidKeyError

/**
 * Error raised when the config's value is of invalid type.
 */
class InvalidValueError extends Error {
  constructor (message) {
    super(message)
    this.name = 'InvalidValueError'
    this.code = 'ERR_INVALID_VALUE'
    this.message = message
  }
}

InvalidValueError.code = 'ERR_INVALID_VALUE'
exports.ERR_INVALID_VALUE = InvalidValueError

/**
 * Error raised when CID is not valid.
 */
class InvalidCidError extends Error {
  constructor (message) {
    super(message)
    this.name = 'InvalidCidError'
    this.code = 'ERR_INVALID_CID'
    this.message = message
  }
}

InvalidCidError.code = 'ERR_INVALID_CID'
exports.ERR_INVALID_CID = InvalidCidError
