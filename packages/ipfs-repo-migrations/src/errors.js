
/**
 * Exception raised when trying to revert migration that is not possible
 * to revert.
 */
export class NonReversibleMigrationError extends Error {
  /**
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = 'NonReversibleMigrationError'
    this.code = NonReversibleMigrationError.code
    this.message = message
  }
}
NonReversibleMigrationError.code = 'ERR_NON_REVERSIBLE_MIGRATION'

/**
 * Exception raised when repo is not initialized.
 */
export class NotInitializedRepoError extends Error {
  /**
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = 'NotInitializedRepoError'
    this.code = NotInitializedRepoError.code
    this.message = message
  }
}
NotInitializedRepoError.code = 'ERR_NOT_INITIALIZED_REPO'

/**
 * Exception raised when required parameter is not provided.
 */
export class RequiredParameterError extends Error {
  /**
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = 'RequiredParameterError'
    this.code = RequiredParameterError.code
    this.message = message
  }
}
RequiredParameterError.code = 'ERR_REQUIRED_PARAMETER'

/**
 * Exception raised when value is not valid.
 */
export class InvalidValueError extends Error {
  /**
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = 'InvalidValueError'
    this.code = InvalidValueError.code
    this.message = message
  }
}
InvalidValueError.code = 'ERR_INVALID_VALUE'

/**
 * Exception raised when config is not passed.
 */
export class MissingRepoOptionsError extends Error {
  /**
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = 'MissingRepoOptionsError'
    this.code = MissingRepoOptionsError.code
    this.message = message
  }
}
MissingRepoOptionsError.code = 'ERR_MISSING_REPO_OPTIONS'
