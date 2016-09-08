# IPFS Repo JavaScript Implementation

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Build Status](https://travis-ci.org/ipfs/js-ipfs-repo.svg)](https://travis-ci.org/ipfs/js-ipfs-repo) [![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-repo.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-repo)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-repo/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-repo?branch=master) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> Implementation of the IPFS repo spec (https://github.com/ipfs/specs/tree/master/repo) in JavaScript

This is the implementation of the [IPFS repo spec](https://github.com/ipfs/specs/tree/master/repo) in JavaScript.

## Table of Contents

- [Background](#background)
  - [Good to know (historical context)](#good-to-know-historical-context)
- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
  - [Use in a browser with browserify, webpack or any other bundler](#use-in-a-browser-with-browserify-webpack-or-any-other-bundler)
  - [Use in a browser Using a script tag](#use-in-a-browser-using-a-script-tag)
- [Usage](#usage)
- [API](#api)
  - [var repo = new IPFSRepo(path, opts)](#var-repo--new-ipfsrepopath-opts)
  - [repo.exists(cb)](#repoexistscb)
  - [repo.version.get(cb(err, version))](#repoversiongetcberr-version)
  - [repo.version.set(version, cb(err))](#repoversionsetversion-cberr)
  - [repo.config.get(cb(err, config))](#repoconfiggetcberr-config)
  - [repo.config.set(config, cb(err))](#repoconfigsetconfig-cberr)
  - [repo.keys](#repokeys)
  - [repo.blockstore.putStream()](#)
  - [repo.blockstore.getStream(key, extension)](#)
  - [repo.datastore](#repodatastore)
- [Contribute](#contribute)
- [License](#license)

## Background

Here is the architectural reasoning for this repo:

```bash
┌─────────────────────────────────┐
│ interface defined by Repo Spec  │
├─────────────────────────────────┤
│                                 │                                  ┌──────────────────────┐
│                                 │                                  │ interface-pull-blob-store  │
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
│   keys    │   │  config   │   │ blockstore │   │ datastore │   │   logs    │   │  version  │
│           │   │           │   │           │   │           │   │           │   │           │
└───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘
```

This provides a well defined interface for creating and interacting with an IPFS
Repo backed by a group of abstract backends for keys, configuration, logs, and
more. Each of the individual repos has an interface defined by
[interface-pull-blob-store](https://github.com/ipfs/interface-pull-blob-store): this
enables us to make IPFS Repo portable (running on Node.js vs the browser) and
accept different types of storage mechanisms for each repo (fs, levelDB, etc).

### Good to know (historical context)

- The datastore folder holds the legacy version of datastore, still built in levelDB, there is a current endeavour of pushing it to fs completely.
- The blocks folder is the current version of datastore.
- The keys repo doesn't exist yet, as the private key is simply stored inside config

## Install

### npm

```sh
> npm i ipfs-repo
```

### Use in Node.js

```JavaScript
var IPFSRepo = require('ipfs-repo')
```

### Use in a browser with browserify, webpack or any other bundler

The code published to npm that gets loaded on require is in fact a ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```JavaScript
var IPFSRepo = require('ipfs-repo')
```

### Use in a browser Using a script tag

Loading this module through a script tag will make the `Unixfs` obj available in the global namespace.

```html
<script src="https://unpkg.com/ipfs-repo/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/ipfs-repo/dist/index.js"></script>
```

## Usage

Example:

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
  [interface-pull-blob-store](https://github.com/ipfs/interface-pull-blob-store), or a
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

### repo.blockstore.putStream()
### repo.datastore.getStream(key, extension)
### repo.datastore.has(key, extension, cb)
### repo.datastore.delete(key, extension, cb)

Read and write buffers to/from the repo's block store.

### repo.datastore

**WIP**

## Contribute

There are some ways you can make this module better:

- Consult our [open issues](https://github.com/ipfs/js-ipfs-repo/issues) and take on one of them
- Help our tests reach 100% coverage!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
