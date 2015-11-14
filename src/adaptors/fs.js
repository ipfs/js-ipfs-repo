var concat = require('concat-stream')
var fs = require('fs-blob-store')
var lockFile = require('lockfile')

function BlobStore (path) {
  this.store = fs(path)
  this.LOCK_PATH = path + '/repo.lock'
}

BlobStore.prototype = {
  read: function (key, cb) {
    var store = this.store
    var LOCK_PATH = this.LOCK_PATH

    function onFinish (buff) {
      lockFile.unlock(LOCK_PATH, function () {
        cb(null, buff.toString('utf8'))
      })
    }

    function onLock (err) {
      if (err) return cb(err)

      var rs = store.createReadStream(key)

      rs.on('error', cb)
      rs.pipe(concat(onFinish))
    }

    lockFile.lock(LOCK_PATH, {}, onLock)
  },

  append: function (key, content, cb) {
    return this._write(key, content, 'a', cb)
  },

  write: function (key, content, cb) {
    return this._write(key, content, 'w', cb)
  },

  _write: function (key, content, flags, cb) {
    var store = this.store
    var LOCK_PATH = this.LOCK_PATH

    function onFinish (err) {
      if (err) return cb(err)

      lockFile.unlock(LOCK_PATH, cb)
    }

    function onLock (err) {
      if (err) return cb(err)

      var ws = store.createWriteStream(key, {flags: flags})

      ws.on('error', cb)
      ws.on('finish', onFinish)

      ws.write(content)
      ws.end()
    }

    lockFile.lock(LOCK_PATH, {}, onLock)
  }
}

module.exports = BlobStore
