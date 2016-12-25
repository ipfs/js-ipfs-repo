'use strict'
const Lock = require('lock')
const parallel = require('async/parallel')

exports = module.exports

exports.setUp = (basePath, BlobStore, locks) => {

  //don't understand what the locks are ???
  //the blobstore is either a leveldb store or a indexdb store ???
  //I beleive this is where we add code to add the 4 keys
  //key1= /F5UXA3TTF4JCB5OTOYTDCBGWYFARRBGGIPJR4KKXVXBGOHK4C5MB47SOZHQM3LH6  - possibly routing records
  //key2= /F5YGWLYSED25G5RGGECNNQKBDCCMMQ6TDYUVPLOCM4OVYF2YDZ7E5SPAZWWP4 - possibly routing records
  //key3= /local/filesroot
  //key4= /local/pins

  var blobStore = new BlobStore(basePath)

  // Does indexdb take a key value pair and if so what format ??
  var key1 = {
      key: 'first routing key',
      value: 'value for first routing key'
  }

  var key2 = {
      key: 'second routing key',
      value: 'value for second routing key'
  }

  var key3 = {
      key: '/local/filesroot',
      value: 'hash of the FILES api root folder - base58 encoded'
  }

  var key4 = {
      key: '/local/pins',
      value: 'hash of the pins folder - base58 encoded'
  }

  //is this async ??
  blobStore.write(key1, callback)
  blobStore.write(key2, callback)
  blobStore.write(key3, callback)
  blobStore.write(key4, callback)

}
