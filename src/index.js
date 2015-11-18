var stores = require('./stores')
var adaptors = require('./adaptors')

/**
 * Constructor
 *
 * @param {String} root_path
 * @param {Maybe<Object>} options
 */
function Repo (root_path, options) {
  this.root_path = root_path
  this.options = options || {}

  var Adaptor = this._chooseAdaptor()
  this.store = new Adaptor(this.root_path)
}

Repo.prototype = {
  _chooseAdaptor: function () {
    var adaptor = adaptors[this.options.adaptor || 'fs']

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

  logs: function () {
    return stores.logs(this.store)
  },

  version: function () {
    return stores.version(this.store)
  }
}

module.exports = Repo
