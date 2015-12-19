var mh = require('multihashes')

var hexValue = '1220120f6af601d46e10b2d2e11ed71c55d25f3042c22501e41d1246e7a1e9d3d8ec'

// function multihashToPath (multihash) {
//   var folder = hash.slice(0, PREFIX_LENGTH)
//   return path.join(folder, hash) + '.data'
// }

var buf = new Buffer(hexValue, 'hex')
console.log(mh.decode(buf))
