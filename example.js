'use strict'

const Repo = require('ipfs-repo')
const repo = new Repo('/Users/awesome/.jsipfs')

repo.init({ my: 'config' })
  .then(repo.open)
  .then(() => console.log('repo is ready'))
