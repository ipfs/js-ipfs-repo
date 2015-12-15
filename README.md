js-ipfs-repo
============

> Implementation of the IPFS repo spec (https://github.com/ipfs/specs/tree/master/repo) in JavaScript

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) [![Build Status](https://travis-ci.org/ipfs/js-ipfs-repo.svg)](https://travis-ci.org/ipfs/js-ipfs-repo) ![](https://img.shields.io/badge/coverage-86%25-yellow.svg?style=flat-square) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

## Description

This is the implementation of the [IPFS repo spec](https://github.com/ipfs/specs/tree/master/repo) in JavaScript.

## Architecture

```bash
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  interface defined by Repo Spec
├─────────────────────────────────┤
│                                 │                                  ┌──────────────────────┐
│                                 │                                  │ abstract-blob-store  │
│           IPFS REPO             │─────────────────────────────────▶│     interface        │
│                                 │                                  ├──────────────────────┤
│                                 │                                  │      locks           │
└─────────────────────────────────┘                                  └──────────────────────┘
                 │
      ┌──────────┴────┬───────────────┬───────────────┬───────────────┬───────────────┐
      ▼               ▼               ▼               ▼               ▼               ▼
┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
│ abstract  │   │ abstract  │   │ abstract  │   │ abstract  │   │ abstract  │   │ abstract  │
│ -blog     │   │ -blog     │   │ -blog     │   │ -blog     │   │ -blog     │   │ -blog     │
│ -store    │   │ -store    │   │ -store    │   │ -store    │   │ -store    │   │ -store    │
│ interface │   │ interface │   │ interface │   │ interface │   │ interface │   │ interface │
├───────────┤   ├───────────┤   ├───────────┤   ├───────────┤   ├───────────┤   ├───────────┤
│           │   │           │   │           │   │           │   │           │   │           │
│   keys    │   │  config   │   │ datastore │   │ datastore │   │   logs    │   │  version  │
│           │   │           │   │           │   │ -legacy   │   │           │   │           │
└───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘
```

IPFS repo exposes a well defined interface by the Repo Spec. Each of the individual repos has an interface defined by [abstract-blob-store](https://github.com/maxogden/abstract-blob-store), this enables us to make IPFS repo portable (running on Node.js vs the browser) and accept different types of storage mechanisms for each repo (fs, levelDB, etc).

## Good to know (historical context)

- The datastore folder holds the legacy version of datastore, still built in levelDB, there is a current endeavour of pushing it to fs completely.
- The blocks folder is the current version of datastore.
- The keys repo doesn't exist yet, as the private key is simply stored inside config

## Usage

### Install

Standard Node.js way.

```bash
$ npm i ipfs-repo
```

### Repo

Constructor, accepts a path and options:

```js
var IPFSRepo = require('js-ipfs-repo')
var repo = new IPFSRepo('/Users/someone/.ipfs', {
  stores: {
    keys: <something that implements abstract-blob-store>,
    config: <something that implements abstract-blob-store>,
    datastore: <something that implements abstract-blob-store>,
    logs: <something that implements abstract-blob-store>,
    locks: <something that implements abstract-blob-store>,
    version: <something that implements abstract-blob-store>
  }})
```

You can check if the repo you are going to access already exists on the path you passed to the constructor by:

```js
repo.exists(function (err, exists) {
  // exists is a boolean value
})
```

If the repo doesn't exist yet, you can start it by executing the `init` cuntion

```js
repo.init(opts, function (err) {})
```

### version

Read/Write the version number of that repository.

```js
repo.version.get(function (err, version) {
  console.log(err, num) // => 2
})

repo.version.set(3, function (err) {
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

### keys

Read/Write keys inside the repo. This feature will be expanded once [IPRS](https://github.com/ipfs/specs/tree/master/records) and [KeyChain](https://github.com/ipfs/specs/tree/master/keychain) are finalized and implemented on go-ipfs.

```js
repo.keys.get(function (err, privKey) {})
```

### datastore

Store data on the block store.

```js
repo.datastore.read('12200007d4e3a319cd8c7c9979280e150fc5dbaae1ce54e790f84ae5fd3c3c1a0475', function (err, buff) {
  console.log(err)
})
```

```js
repo.datastore.write(buff, function (err, buffer) {
  console.log(buff.toString('utf-8'), err)
})
```

### datastore legacy

> WIP

```js
repo.datastoreLegacy
```

```js
repo.datastoreLegacy
```

### locks

> **Note: You shouldn't need to use this. It is used internally**

Read/Write the `repo.lock` file.

```js
repo.locks.lock(function (err) {})

repo.locks.unlock(function (err) {})
```

### logs

> No longer supported, see https://github.com/ipfs/js-ipfs-repo/issues/8

## Contribute

There is some ways you can make this module better:

- You can consult our open issues and take on one of them
- Make the tests better
- Make the tests work in the Browser
