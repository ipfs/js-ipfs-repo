'use strict'

/**
 * Exception raised when trying to revert migration that is not possible
 * to revert.
 */
class NonReversibleMigrationError extends Error {
  /**
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = 'NonReversibleMigrationError'
    this.code = 'ERR_NON_REVERSIBLE_MIGRATION'
    this.message = message
  }
}
NonReversibleMigrationError.code = 'ERR_NON_REVERSIBLE_MIGRATION'

/**
 * Exception raised when repo is not initialized.
 */
class NotInitializedRepoError extends Error {
  /**
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = 'NotInitializedRepoError'
    this.code = 'ERR_NOT_INITIALIZED_REPO'
    this.message = message
  }
}
NotInitializedRepoError.code = 'ERR_NOT_INITIALIZED_REPO'

/**
 * Exception raised when required parameter is not provided.
 */
class RequiredParameterError extends Error {
  /**
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = 'RequiredParameterError'
    this.code = 'ERR_REQUIRED_PARAMETER'
    this.message = message
  }
}
RequiredParameterError.code = 'ERR_REQUIRED_PARAMETER'

/**
 * Exception raised when value is not valid.
 */
class InvalidValueError extends Error {
  /**
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = 'InvalidValueError'
    this.code = 'ERR_INVALID_VALUE'
    this.message = message
  }
}
InvalidValueError.code = 'ERR_INVALID_VALUE'

/**
 * Exception raised when config is not passed.
 */
class MissingRepoOptionsError extends Error {
  /**
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = 'MissingRepoOptionsError'
    this.code = 'ERR_MISSING_REPO_OPTIONS'
    this.message = message
  }
}
MissingRepoOptionsError.code = 'ERR_MISSING_REPO_OPTIONS'

module.exports = {
  NonReversibleMigrationError,
  NotInitializedRepoError,
  RequiredParameterError,
  InvalidValueError,
  MissingRepoOptionsError
}
