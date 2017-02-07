'use strict'
const Lock = require('lock')
const parallel = require('async/parallel')
const pull = require('pull-stream')

exports = module.exports

exports.setUp = (basePath, BlobStore, locks) => {

  //don't understand what the locks are ???
  //The 4 keys are as follows
  //key1= /F5UXA3TTF4JCB5OTOYTDCBGWYFARRBGGIPJR4KKXVXBGOHK4C5MB47SOZHQM3LH6  - possibly routing records
  //key2= /F5YGWLYSED25G5RGGECNNQKBDCCMMQ6TDYUVPLOCM4OVYF2YDZ7E5SPAZWWP4 - possibly routing records
  //key3= /local/filesroot
  //key4= /local/pins

  //the hash of /local/filesroot can be found with ipfs files stat --hash /
  var blobStore = new BlobStore(basePath)
  
  write(key, data) {
    pull(pull.values([new Buffer(data)]), store.write(key))
  }

}
