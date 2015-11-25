module.exports = function (store) {
  return {
    read: function (cb) {
      return store.readWithoutLock('api', cb)
    },

    write: function (content, cb) {
      return store.writeWithoutLock('api', content, cb)
    }
  }
}
