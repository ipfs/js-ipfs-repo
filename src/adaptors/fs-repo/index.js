var concat = require('concat-stream')
var fs = require('fs-blob-store')
var path = require('path')
var lockFile = require('lockfile')

function BlobStore (base_path) {
  this.store = fs(base_path)
  this.LOCK_PATH = path.join(base_path, 'repo.lock')
}

BlobStore.prototype = {

  /**
   * Read a blob on a given path
   * It holds the repo.lock while reading
   *
   * @param {String} key
   * @param {Function} cb
   * @return {ReadableStream}
   */
  read: function (key, cb) {
    var store = this.store
    var LOCK_PATH = this.LOCK_PATH
    var rs = store.createReadStream(key)

    function onFinish (buff) {
      lockFile.unlock(LOCK_PATH, function (err) {
        if (err) return cb(err)

        cb(null, buff.toString('utf8'))
      })
    }

    function onLock (err) {
      if (err) return cb(err)

      rs.on('error', cb)
      rs.pipe(concat(onFinish))
    }

    lockFile.lock(LOCK_PATH, {}, onLock)

    return rs
  },

  /**
   * Read a blob on a given path
   * It does not lock
   *
   * @param {String} key
   * @param {Function} cb
   * @return {ReadableStream}
   */
  readWithoutLock: function (key, cb) {
    var rs = this.store.createReadStream(key)

    rs.on('error', cb)
    rs.pipe(concat(function (buff) {
      cb(null, buff.toString('utf8'))
    }))

    return rs
  },

  /**
   * Write the contents to the blob in the given path
   * It holds the repo.lock while reading
   *
   * @param {String} key
   * @param {Function} cb
   * @return {WritableStream}
   */
  write: function (key, content, cb) {
    var store = this.store
    var LOCK_PATH = this.LOCK_PATH
    var ws = store.createWriteStream(key)

    function onFinish (err) {
      if (err) return cb(err)

      lockFile.unlock(LOCK_PATH, cb)
    }

    function onLock (err) {
      if (err) return cb(err)

      ws.on('error', cb)
      ws.on('finish', onFinish)

      ws.write(content)
      ws.end()
    }

    lockFile.lock(LOCK_PATH, {}, onLock)

    return ws
  },

  /**
   * Writes content to a blob on a given path
   * It does not lock
   *
   * @param {String} key
   * @param {String} content
   * @param {Function} cb
   * @return {WritableStream}
   */
  writeWithoutLock: function (key, content, cb) {
    var ws = this.store.createWriteStream(key)

    ws.on('error', cb)
    ws.on('finish', cb)

    ws.write(content)
    ws.end()

    return ws
  }
}

module.exports = BlobStore
