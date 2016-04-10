IPFS Repo JavaScript Implementation
===================================

> Implementation of the IPFS repo spec (https://github.com/ipfs/specs/tree/master/repo) in JavaScript

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://travis-ci.org/ipfs/js-ipfs-repo.svg)](https://travis-ci.org/ipfs/js-ipfs-repo)
![](https://img.shields.io/badge/coverage-90%25-yellow.svg?style=flat-square) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![dignified.js](https://img.shields.io/badge/uses-dignified.js-blue.svg?style=flat-square)](https://github.com/dignifiedquire/dignified.js)

## Description

This is the implementation of the [IPFS repo spec](https://github.com/ipfs/specs/tree/master/repo) in JavaScript.

## Architecture

```bash
┌─────────────────────────────────┐
│ interface defined by Repo Spec  │
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
│ -blob     │   │ -blob     │   │ -blob     │   │ -blob     │   │ -blob     │   │ -blob     │
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

# Installation

## npm

```sh
> npm i ipfs-repo
```

## Use in Node.js

```JavaScript
var IPFSRepo = require('ipfs-repo')
```

## Use in a browser with browserify, webpack or any other bundler

The code published to npm that gets loaded on require is in fact a ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```JavaScript
var IPFSRepo = require('ipfs-repo')
```

## Use in a browser Using a script tag

Loading this module through a script tag will make the `Unixfs` obj available in the global namespace.

```html
<script src="https://npmcdn.com/ipfs-repo/dist/index.min.js"></script>
<!-- OR -->
<script src="https://npmcdn.com/ipfs-repo/dist/index.js"></script>
```


# Usage

```js
var fsBlobStore = require('fs-blob-store')  // an in-memory blob store
var IPFSRepo = require('js-ipfs-repo')
var repo = new IPFSRepo('/Users/someone/.ipfs', {
  stores: blobStore
})
```

## API

```js
var IPFSRepo = require('ipfs-repo')
```

### var repo = new IPFSRepo(path, opts)

Creates a **reference** to an IPFS repository at the path `path`. This does
*not* create the repo, but is an object that refers to the repo at such a path.

Valid keys for `opts` include:

- `stores`: either an
  [abstract-blob-store](https://github.com/maxogden/abstract-blob-store), or a
  map of the form

```js
{
  keys: someBlobStore,
  config: someBlobStore,
  datastore: someBlobStore,
  logs: someBlobStore,
  locks: someBlobStore,
  version: someBlobStore
}
```

If you use the former form, all of the sub-blob-stores will use the same store.

### repo.init(config, cb)

Initializes the IPFS repository at the repo's `path`. Currently this is a no-op.

Consumes a config object `config` *(TODO: specification?)* By default, init requires the repo not yet exist (by default). Calls the callback `cb(err)` on completion or error.

### repo.exists(cb)

Check if the repo you are going to access already exists. Calls the callback
`cb(err, exists)`, where `exists` is true or false.

### repo.version.get(cb(err, version))
### repo.version.set(version, cb(err))

Read/write the version number of the repository. The version number is the repo version number.

### repo.config.get(cb(err, config))
### repo.config.set(config, cb(err))

Read/write the configuration object of the repository.

### repo.keys

Read/write keys inside the repo. This feature will be expanded once
[IPRS](https://github.com/ipfs/specs/tree/master/records) and
[KeyChain](https://github.com/ipfs/specs/tree/master/keychain) are finalized and implemented on go-ipfs.

### repo.datastore.read(key, cb(err, buffer))
### repo.datastore.write(buffer, cb(err, buffer))

Read and write buffers to/from the repo's block store.

### repo.datastoreLegacy

**WIP**

## Install

Install via npm:

```bash
$ npm i ipfs-repo
```

## Contribute

There are some ways you can make this module better:

- Consult our open issues and take on one of them
- Make the tests better
- Make the tests work in the Browser
