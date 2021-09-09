'use strict'

const path = require('path')

const esbuild = {
  // this will inject all the named exports from 'node-globals.js' as globals
  inject: [path.join(__dirname, 'scripts/node-globals.js')]
}

/** @type {import('aegir').PartialOptions} */
module.exports = {
  test: {
    browser: {
      config: {
        buildConfig: esbuild
      }
    }
  },
  build: {
    bundlesizeMax: '37kB'
  }
}
