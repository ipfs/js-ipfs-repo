'use strict'
const Lock = require('lock')

exports = module.exports

exports.setUp = (basePath, BlobStore, locks) => {
  const store = new BlobStore(basePath + '/blocks')
  const lock = new Lock()
}
