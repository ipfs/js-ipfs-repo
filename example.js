'use strict'

const Repo = require('ipfs-repo');

(async () => {
  const repo = new Repo('/Users/awesome/.jsipfs')

  await repo.init({ my: 'config' })
  await repo.open()
  console.log('repo is ready') // eslint-disable-line no-console
})()
