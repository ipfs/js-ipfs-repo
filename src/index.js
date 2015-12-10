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
  this.loaded = false
}

Repo.prototype = {
  _chooseAdaptor: function () {
    var adaptor = adaptors[this.options.adaptor || 'fs-repo']

    if (!adaptor) {
      throw new Error('Adaptor "' + this.options.adaptor + '" not supported')
    }

    return adaptor
  },

  exists: function () {
    try {
      return !!fs.statSync(this.root_path)
    } catch (err) {
      return false
    }
  },

  load: function () {
    if (this.loaded) { return }
    var Adaptor = this._chooseAdaptor()
    this.store = new Adaptor(this.root_path)

    this.api = stores.config(this.store)
    this.config = stores.config(this.store)
    this.version = stores.version(this.store)
    this.blocks = stores.blocks(this.store)
    this.loaded = true
  }
}

module.exports = Repo
