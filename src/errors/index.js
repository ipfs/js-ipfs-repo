'use strict'

class LockExists extends Error {
  constructor (message) {
    super(message)
    this.name = 'LockExists'
    this.message = message
  }
}

exports.ERR_REPO_NOT_INITIALIZED = 'ERR_REPO_NOT_INITIALIZED'
exports.LockExists = LockExists