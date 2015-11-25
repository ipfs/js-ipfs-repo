module.exports = function (store) {
  return {
    read: function (cb) {
      return store.read('version', function (err, num) {
        if (err) return cb(err)

        cb(null, num.split('\n')[0])
      })
    },

    write: function (content, cb) {
      return store.write('version', content, cb)
    }
  }
}
