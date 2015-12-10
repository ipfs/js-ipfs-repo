js-ipfs-repo
============


[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) [![Build Status](https://travis-ci.org/ipfs/js-ipfs-repo.svg)](https://travis-ci.org/ipfs/js-ipfs-repo) ![](https://img.shields.io/badge/coverage-%3F-yellow.svg?style=flat-square) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> Implementation of the IPFS repo spec (https://github.com/ipfs/specs/tree/master/repo) in JavaScript

## API

### `Repo`

Constructor, accepts a path and options:

```js
var Repo = require('js-ipfs-repo')
var repo = new Repo('/Users/someone/.ipfs', {adaptor: 'fs'})
```

Options:

  - `adaptor`: String with the adaptor. Defaults to `fs`

### version

Read/Write the version number of that repository.

```js
repo.version.read(function (err, num) {
  console.log(err, num) // => 2
})

repo.version.write(3, function (err) {
  console.log(err)
})
```

### api

Read/Write the JSON configuration for that repository.

```js
repo.api.read(function (err, multiaddr) {
  console.log(err, multiaddr)
})

repo.api.write('/ip4/127.0.0.1/tcp/5001', function (err) {
  console.log(err)
})
```

### config

Read/Write the JSON configuration for that repository.

```js
repo.config.read(function (err, json) {
  console.log(err, json)
})

repo.config.write({foo: 'bar'}, function (err) {
  console.log(err)
})
```

### blocks

Store data on the block store.

```js
repo.blocks.read('12200007d4e3a319cd8c7c9979280e150fc5dbaae1ce54e790f84ae5fd3c3c1a0475', function (buff, err) {
  console.log(err)
})
```

```js
repo.blocks.write(buff, function (buff, err) {
  console.log(buff.toString('utf-8'), err)
})
```

### repo

Read/Write the `repo.lock` file.

```js
repo.repo.read(function (err, content) {
  console.log(err, content)
})

repo.repo.write('foo', function (err) {
  console.log(err)
})
```

## Adaptors

By default it will use the `fs-repo` adaptor. Eventually we can write other adaptors
and make those available on configuration.

### fs-repo

The default adaptor. Uses the `repo.lock` file to ensure there are no simultaneous reads
nor writes. Uses the `fs-blob-store`.

### memory-repo

Ideal for testing purposes. Uses the `abstract-blob-store`.

## Tests

Help us make more tests! Also, enabling them to be run in Node.js and the Browser.
