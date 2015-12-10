var concat = require('concat-stream')
var ms = require('abstract-blob-store')

function BlobStore () {
  this.store = ms()
}

BlobStore.prototype = {

  /**
   * Read a blob on a given path
   *
   * @param {String} key
   * @param {Function} cb
   * @return {ReadableStream}
   */
  read: function (key, cb) {
    var store = this.store
    var rs = store.createReadStream(key)

    function onFinish (buff) {
      cb(null, buff.toString('utf8'))
    }

    rs.on('error', cb)
    rs.pipe(concat(onFinish))

    return rs
  },

  /**
   * Read a blob on a given path
   *
   * @param {String} key
   * @param {Function} cb
   * @return {ReadableStream}
   */
  readWithoutLock: function (key, cb) {
    return this.read(key, cb)
  },

  /**
   * Write the contents to the blob in the given path
   *
   * @param {String} key
   * @param {Function} cb
   * @return {WritableStream}
   */
  write: function (key, content, cb) {
    var store = this.store
    var ws = store.createWriteStream(key)

    ws.on('error', cb)
    ws.on('finish', cb)

    ws.write(content)
    ws.end()

    return ws
  },

  /**
   * Write the contents to the blob in the given path
   *
   * @param {String} key
   * @param {Function} cb
   * @return {WritableStream}
   */
  writeWithoutLock: function (key, cb) {
    return this.write(key, cb)
  }
}

module.exports = BlobStore
