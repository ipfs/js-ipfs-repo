'use strict'

// Default configuration for the datastore spec in node.js
module.exports = {
<<<<<<< HEAD
=======
  StorageGCWatermark: 90,
  GCPeriod: '1h',
  BloomFilterSize: 0,
>>>>>>> fix: interoperability with go repo - added tests
  Spec: {
    type: 'mount',
    mounts: [
      {
        mountpoint: '/blocks',
        type: 'measure',
        prefix: 'flatfs.datastore',
        child: {
          type: 'flatfs',
          path: 'blocks',
          sync: true,
          shardFunc: '/repo/flatfs/shard/v1/next-to-last/2'
        }
      },
      {
        mountpoint: '/',
        type: 'measure',
        prefix: 'leveldb.datastore',
        child: {
          type: 'levelds',
          path: 'datastore',
          compression: 'none'
        }
      }
    ]
  }
}
