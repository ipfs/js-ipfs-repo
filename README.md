# IPFS Repo JavaScript Implementation

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-repo)](https://travis-ci.com/ipfs/js-ipfs-repo)
[![codecov](https://codecov.io/gh/ipfs/js-ipfs-repo/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-repo) [![Dependency Status](https://david-dm.org/ipfs/js-ipfs-repo.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat-square)

> Implementation of the IPFS repo spec (https://github.com/ipfs/specs/tree/master/repo) in JavaScript

This is the implementation of the [IPFS repo spec](https://github.com/ipfs/specs/tree/master/repo) in JavaScript.

## Lead Maintainer

[Jacob Heun](https://github.com/jacobheun)

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
                                   ┌───────────┴───────────┐
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
         ┌───────────┴───────────┐                           ┌───────────┴───────────┐
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

await repo.init({ cool: 'config' })
await repo.open()
console.log('repo is ready')
```

This now has created the following structure, either on disk or as an in memory representation:

```
├── blocks
│   ├── SHARDING
│   └── _README
├── config
├── datastore
├── keys
└── version
```

## API

### Setup

#### `new Repo(path[, options])`

Creates an IPFS Repo.

Arguments:

* `path` (string, mandatory): the path for this repo
* `options` (object, optional): may contain the following values
  * `lock` ([Lock](#lock) or string *Deprecated*): what type of lock to use. Lock has to be acquired when opening. string can be `"fs"` or `"memory"`.
  * `storageBackends` (object, optional): may contain the following values, which should each be a class implementing the [datastore interface](https://github.com/ipfs/interface-datastore#readme):
    * `root` (defaults to [`datastore-fs`](https://github.com/ipfs/js-datastore-fs#readme) in Node.js and [`datastore-level`](https://github.com/ipfs/js-datastore-level#readme) in the browser). Defines the back-end type used for gets and puts of values at the root (`repo.set()`, `repo.get()`)
    * `blocks` (defaults to [`datastore-fs`](https://github.com/ipfs/js-datastore-fs#readme) in Node.js and [`datastore-level`](https://github.com/ipfs/js-datastore-level#readme) in the browser). Defines the back-end type used for gets and puts of values at `repo.blocks`.
    * `keys` (defaults to [`datastore-fs`](https://github.com/ipfs/js-datastore-fs#readme) in Node.js and [`datastore-level`](https://github.com/ipfs/js-datastore-level#readme) in the browser). Defines the back-end type used for gets and puts of encrypted keys at `repo.keys`
    * `datastore` (defaults to [`datastore-level`](https://github.com/ipfs/js-datastore-level#readme)). Defines the back-end type used as the key-value store used for gets and puts of values at `repo.datastore`.

```js
const repo = new Repo('path/to/repo')
```

#### `Promise repo.init ()`

Creates the necessary folder structure inside the repo.

#### `Promise repo.open ()`

[Locks](https://en.wikipedia.org/wiki/Record_locking) the repo to prevent conflicts arising from simultaneous access.

#### `Promise repo.close ()`

Unlocks the repo.

#### `Promise<boolean> repo.exists ()`

Tells whether this repo exists or not. Returned promise resolves to a `boolean`.

### Repos

Root repo:

#### `Promise repo.put (key, value:Buffer)`

Put a value at the root of the repo.

* `key` can be a buffer, a string or a [Key](https://github.com/ipfs/interface-datastore#keys).

#### `Promise<Buffer> repo.get (key)`

Get a value at the root of the repo.

* `key` can be a buffer, a string or a [Key](https://github.com/ipfs/interface-datastore#keys).

[Blocks](https://github.com/ipfs/js-ipfs-block#readme):

#### `Promise repo.blocks.put (block:Block)`

* `block` should be of type [Block](https://github.com/ipfs/js-ipfs-block#readme).

#### `Promise repo.blocks.putMany (blocks)`

Put many blocks.

* `block` should be an Iterable or AsyncIterable that yields entries of type [Block](https://github.com/ipfs/js-ipfs-block#readme).

#### `Promise<Buffer> repo.blocks.get (cid)`

Get block.

* `cid` is the content id of [type CID](https://github.com/ipld/js-cid#readme).

Datastore:

#### `repo.datastore`

This contains a full implementation of [the `interface-datastore` API](https://github.com/ipfs/interface-datastore#api).


### Utils

#### `repo.config`

Instead of using `repo.set('config')` this exposes an API that allows you to set and get a decoded config object, as well as, in a safe manner, change any of the config values individually.

##### `Promise repo.config.set(key:string, value)`

Set a config value. `value` can be any object that is serializable to JSON.

* `key` is a string specifying the object path. Example:

```js
await repo.config.set('a.b.c', 'c value')
const config = await repo.config.get()
assert.equal(config.a.b.c, 'c value')
```

##### `Promise repo.config.set(value)`

Set the whole config value. `value` can be any object that is serializable to JSON.

##### `Promise<?> repo.config.get(key:string)`

Get a config value. Returned promise resolves to the same type that was set before.

* `key` is a string specifying the object path. Example:

```js
const value = await repo.config.get('a.b.c')
console.log('config.a.b.c = ', value)
```

##### `Promise<Object> repo.config.get()`

Get the entire config value.

#### `Promise<boolean> repo.config.exists()`

Whether the config sub-repo exists.

#### `repo.version`

##### `Promise<Number> repo.version.get ()`

Gets the repo version (an integer).

##### `Promise repo.version.set (version:Number)`

Sets the repo version

#### `repo.apiAddr`

#### `Promise<String> repo.apiAddr.get ()`

Gets the API address.

#### `Promise repo.apiAddr.set (value)`

Sets the API address.

* `value` should be a [Multiaddr](https://github.com/multiformats/js-multiaddr) or a String representing a valid one.

### `Promise<Object> repo.stat ([options])`

Gets the repo status.

`options` is an object which might contain the key `human`, which is a boolean indicating whether or not the `repoSize` should be displayed in MiB or not.

Returned promise resolves to an `Object` with the following keys:

- `numObjects`
- `repoPath`
- `repoSize`
- `version`
- `storageMax`

### Lock

IPFS Repo comes with two built in locks: memory and fs. These can be imported via the following:

```js
const fsLock = require('ipfs-repo/src/lock')  // Default in Node.js
const memoryLock = require('ipfs-repo/src/lock-memory')  // Default in browser
```

You can also provide your own custom Lock. It must be an object with the following interface:

#### `Promise lock.lock (dir)`

Sets the lock if one does not already exist. If a lock already exists, should throw an error.

`dir` is a string to the directory the lock should be created at. The repo typically creates the lock at its root.

Returns `closer`, where `closer` has a `close` method for removing the lock.

##### `Promise closer.close ()`

Closes the lock created by `lock.open`

If no error was thrown, the lock was successfully removed.

#### `Promise<boolean> lock.locked (dir)`

Checks the existence of the lock.

`dir` is the path to the directory to check for the lock. The repo typically checks for the lock at its root.

Returned promise resolves to a `boolean` indicating the existence of the lock.

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
