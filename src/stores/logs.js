module.exports = function (store) {
  return {
    truncate: function (log, cb) {
      return store.write('logs/' + log, '', cb)
    },

    append: function (log, content, cb) {
      return store.append('logs/' + log, content, cb)
    }
  }
}
