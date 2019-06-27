'use strict'

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
