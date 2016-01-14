const PREFIX_LENGTH = 8

exports = module.exports

exports.setUp = (basePath, blobStore, locks) => {
  var store = blobStore(basePath + '/blocks/')

  return {
    createReadStream: multihash => {
      var path = multihashToPath(multihash)
      return store.createReadStream(path)
    },

    createWriteStream: (multihash, cb) => {
      var path = multihashToPath(multihash)
      return store.createWriteStream(path, cb)
    }
  }
}

function multihashToPath (multihash) {
  var filename = multihash.toString('hex') + '.data'
  var folder = filename.slice(0, PREFIX_LENGTH)
  var path = folder + '/' + filename

  return path
}
