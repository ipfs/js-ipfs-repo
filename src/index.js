var stores = require('./stores')
var adaptors = require('./adaptors')
var fs = require('fs')

/**
 * Constructor
 *
 * @param {String} root_path
 * @param {Maybe<Object>} options
 */
function Repo (root_path, options) {
  this.root_path = root_path
  this.options = options || {}
}

Repo.prototype = {
  _chooseAdaptor: function () {
    var adaptor = adaptors[this.options.adaptor || 'fs-repo']

    if (!adaptor) {
      throw new Error('Adaptor "' + this.options.adaptor + '" not supported')
    }

    return adaptor
  },

  api: function () {
    return stores.config(this.store)
  },

  config: function () {
    return stores.config(this.store)
  },

  version: function () {
    return stores.version(this.store)
  },

  blocks: function () {
    return stores.blocks(this.store)
  },

  exists: function () {
    try {
      return !!fs.statSync(this.root_path)
    } catch (err) {
      return false
    }
  },

  load: function () {
    var Adaptor = this._chooseAdaptor()
    this.store = new Adaptor(this.root_path)
  }

}

module.exports = Repo
