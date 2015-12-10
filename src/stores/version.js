module.exports = function (store) {
  return {
    read: function (cb) {
      store.read('version', function (err, num) {
        if (err) return cb(err)

        cb(null, num.split('\n')[0])
      })
    },

    readStream: function () {
      // TODO impl it properly - this works because store.read is returning the stream, but it needs to be actually aware we expect to receive the stream
      return store.read('version', function (err, num) {
        if (err) {}
      })
    },

    write: function (content, cb) {
      return store.write('version', content, cb)
    }
  }
}
