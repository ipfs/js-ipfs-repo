exports = module.exports

exports.setUp = function (basePath, blobStore) {

}
/*
module.exports = function (store) {
  return {
    read: function (cb) {
      return store.readWithoutLock('repo.lock', cb)
    },

    write: function (content, cb) {
      return store.writeWithoutLock('repo.lock', content, cb)
    }
  }
}
*/
