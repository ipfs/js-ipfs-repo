module.exports = function (store) {
  return {
    read: function (cb) {
      return store.read('config', function (err, content) {
        if (err) return cb(err)

        try {
          cb(null, JSON.parse(content))
        } catch (e) {
          cb(e)
        }
      })
    },

    write: function (content, cb) {
      return store.write('config', JSON.stringify(content), cb)
    }
  }
}
