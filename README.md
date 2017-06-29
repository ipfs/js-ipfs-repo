# IPFS Repo JavaScript Implementation

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Build Status](https://travis-ci.org/ipfs/js-ipfs-repo.svg)](https://travis-ci.org/ipfs/js-ipfs-repo) [![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-repo.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-repo)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-repo/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-repo?branch=master) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/ipfs-js-repo.svg)](https://saucelabs.com/u/ipfs-js-repo)

> Implementation of the IPFS repo spec (https://github.com/ipfs/specs/tree/master/repo) in JavaScript

This is the implementation of the [IPFS repo spec](https://github.com/ipfs/specs/tree/master/repo) in JavaScript.

## Table of Contents

- [Background](#background)
- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
  - [Use in a browser with browserify, webpack or any other bundler](#use-in-a-browser-with-browserify-webpack-or-any-other-bundler)
  - [Use in a browser Using a script tag](#use-in-a-browser-using-a-script-tag)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Background

Here is the architectural reasoning for this repo:

```bash
                          ┌────────────────────────────────────────┐
                          │                IPFSRepo                │
                          └────────────────────────────────────────┘
                                      ┌─────────────────┐
                                      │        /        │
                                      ├─────────────────┤
                                      │    Datastore    │
                                      └─────────────────┘
                                               │
                                   ┌───────────┴───────────┐
                                   │                       │
                          ┌─────────────────┐     ┌─────────────────┐
                          │     /blocks     │     │   /datastore    │
                          ├─────────────────┤     ├─────────────────┤
                          │    Datastore    │     │ LevelDatastore  │
                          └─────────────────┘     └─────────────────┘

┌────────────────────────────────────────┐          ┌────────────────────────────────────────┐
│       IPFSRepo - Default Node.js       │          │       IPFSRepo - Default Browser       │
└────────────────────────────────────────┘          └────────────────────────────────────────┘
            ┌─────────────────┐                                 ┌─────────────────┐
            │        /        │                                 │        /        │
            ├─────────────────┤                                 ├─────────────────┤
            │   FsDatastore   │                                 │LevelJSDatastore │
            └─────────────────┘                                 └─────────────────┘
                     │                                                   │
         ┌───────────┴───────────┐                           ┌───────────┴───────────┐
         │                       │                           │                       │
┌─────────────────┐     ┌─────────────────┐         ┌─────────────────┐     ┌─────────────────┐
│     /blocks     │     │   /datastore    │         │     /blocks     │     │   /datastore    │
├─────────────────┤     ├─────────────────┤         ├─────────────────┤     ├─────────────────┤
│ FlatfsDatastore │     │LevelDBDatastore │         │LevelJSDatastore │     │LevelJSDatastore │
└─────────────────┘     └─────────────────┘         └─────────────────┘     └─────────────────┘
```

This provides a well defined interface for creating and interacting with an IPFS repo.

## Install

### npm

```sh
> npm install ipfs-repo
```

### Use in Node.js

```js
var IPFSRepo = require('ipfs-repo')
```

### Use in a browser with browserify, webpack or any other bundler

```js
var IPFSRepo = require('ipfs-repo')
```

### Use in a browser Using a script tag

Loading this module through a script tag will make the `IpfsRepo` obj available in the global namespace.

```html
<script src="https://unpkg.com/ipfs-repo/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/ipfs-repo/dist/index.js"></script>
```

## Usage

Example:

```js
const Repo = require('ipfs-repo')
const repo = new Repo('/tmp/ipfs-repo')

repo.init({ cool: 'config' }, (err) => {
  if (err) {
    throw err
  }

  repo.open((err) => {
    if (err) {
      throw err
    }

    console.log('repo is ready')
  })
})
```

This now has created the following structure, either on disk or as an in memory representation:

```
├── blocks
│   ├── SHARDING
│   └── _README
├── config
├── datastore
└── version
```

## API

### new Repo(path[, options])

Creates an IPFS Repo.

Arguments:

* `path` (string, mandatory): the path for this repo
* `options` (object, optional): may contain the following values
  * `lock` (string, defaults to `"fs"` in Node.js, `"memory"` in the browser): what type of lock to use. Lock has to be acquired when opening.
  * `storageBackends` (object, optional): may contain the following values, which should each be a class implementing the [datastore interface](https://github.com/ipfs/interface-datastore#readme):
    * `root` (defaults to [`datastore-fs`](https://github.com/ipfs/js-datastore-fs#readme) in Node.js and [`datastore-level`](https://github.com/ipfs/js-datastore-level#readme) in the browser)
    * `blocks` (defaults to [`datastore-fs`](https://github.com/ipfs/js-datastore-fs#readme) in Node.js and [`datastore-level`](https://github.com/ipfs/js-datastore-level#readme) in the browser)
    * `datastore` (defaults to `datastore-level`)

```js
const repo = new Repo('path/to/repo')
```

### repo.init (callback)

Creates the necesary folder structure inside the repo.

### repo.open (callback)

Locks the repo.

### repo.close (callback)

Unlocks the repo.

### repo.put (key, value:Buffer, callback)

Put a value at the root of the repo.

* `key` can be a buffer, a string or a [Key](https://github.com/ipfs/interface-datastore#keys).

### repo.get (key, callback)

Get a value at the root of the repo.

* `key` can be a buffer, a string or a [Key](https://github.com/ipfs/interface-datastore#keys).
* `callback` is a callback function `function (err, result:Buffer)`

### repo.blocks.put (key, value, callback)

Put block.

* `key` can be a buffer, a string or a [Key](https://github.com/ipfs/interface-datastore#keys).
* `value` should be a buffer.

### repo.blocks.get (key, callback)

Get block.

* `key` can be a buffer, a string or a [Key](https://github.com/ipfs/interface-datastore#keys).
* `callback` is a callback function `function (err, result:Buffer)`

### repo.datastore

This is contains a full implementation of [the `interface-datastore` API](https://github.com/ipfs/interface-datastore#api).

### repo.config.put(key:string, value, callback)

Set a config value. `value` can be any object that is serializable to JSON.

### repo.config.get(key:string, callback)

Get a config value. `callback` is a function with the signature: `function (err, value)`, wehre the `value` is of the same type that was set before.

## Notes

- [Explanation of how repo is structured](https://github.com/ipfs/js-ipfs-repo/pull/111#issuecomment-279948247)

## Contribute

There are some ways you can make this module better:

- Consult our [open issues](https://github.com/ipfs/js-ipfs-repo/issues) and take on one of them
- Help our tests reach 100% coverage!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
