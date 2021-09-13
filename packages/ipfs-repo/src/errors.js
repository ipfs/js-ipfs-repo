/**
 * Error raised when there is lock already in place when repo is being opened.
 */
export class LockExistsError extends Error {
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

/**
 * Error raised when requested item is not found.
 */
export class NotFoundError extends Error {
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

/**
 * Error raised when version of the stored repo is not compatible with version of this package.
 */
export class InvalidRepoVersionError extends Error {
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

export const ERR_REPO_NOT_INITIALIZED = 'ERR_REPO_NOT_INITIALIZED'
export const ERR_REPO_ALREADY_OPEN = 'ERR_REPO_ALREADY_OPEN'
export const ERR_REPO_ALREADY_CLOSED = 'ERR_REPO_ALREADY_CLOSED'
