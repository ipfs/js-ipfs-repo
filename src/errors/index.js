'use strict'

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
exports.LockExistsError = LockExistsError

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
exports.NotFoundError = NotFoundError

exports.ERR_REPO_NOT_INITIALIZED = 'ERR_REPO_NOT_INITIALIZED'
exports.ERR_REPO_ALREADY_OPEN = 'ERR_REPO_ALREADY_OPEN'
exports.ERR_REPO_ALREADY_CLOSED = 'ERR_REPO_ALREADY_CLOSED'
