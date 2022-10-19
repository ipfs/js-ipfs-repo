# ipfs-repo <!-- omit in toc -->

[![ipfs.tech](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://ipfs.tech)
[![Discuss](https://img.shields.io/discourse/https/discuss.ipfs.tech/posts.svg?style=flat-square)](https://discuss.ipfs.tech)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipfs-repo.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-repo)
[![CI](https://img.shields.io/github/workflow/status/ipfs/js-ipfs-repo/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/ipfs/js-ipfs-repo/actions/workflows/js-test-and-release.yml)

> IPFS Repo implementation

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Background](#background)
- [Usage](#usage)
- [API](#api)
  - [Setup](#setup)
    - [`createRepo(path[, options])`](#createrepopath-options)
    - [`Promise repo.init()`](#promise-repoinit)
    - [`Promise repo.open()`](#promise-repoopen)
    - [`Promise repo.close()`](#promise-repoclose)
    - [`Promise<boolean> repo.exists()`](#promiseboolean-repoexists)
    - [`Promise<Boolean> repo.isInitialized()`](#promiseboolean-repoisinitialized)
  - [Repos](#repos)
    - [`Promise repo.put(key, value:Uint8Array)`](#promise-repoputkey-valueuint8array)
    - [`Promise<Uint8Array> repo.get(key)`](#promiseuint8array-repogetkey)
  - [Blocks](#blocks)
    - [`Promise<Block> repo.blocks.put(block:Block)`](#promiseblock-repoblocksputblockblock)
    - [`AsyncIterator<Block> repo.blocks.putMany(source:AsyncIterable<Block>)`](#asynciteratorblock-repoblocksputmanysourceasynciterableblock)
    - [`Promise<Block> repo.blocks.get(cid:CID)`](#promiseblock-repoblocksgetcidcid)
    - [`AsyncIterable<Block> repo.blocks.getMany(source:AsyncIterable<CID>)`](#asynciterableblock-repoblocksgetmanysourceasynciterablecid)
    - [`Promise<boolean> repo.blocks.has (cid:CID)`](#promiseboolean-repoblockshas-cidcid)
    - [`Promise<boolean> repo.blocks.delete (cid:CID)`](#promiseboolean-repoblocksdelete-cidcid)
    - [`AsyncIterator<Block|CID> repo.blocks.query (query)`](#asynciteratorblockcid-repoblocksquery-query)
    - [`Promise<CID> repo.blocks.delete(cid:CID)`](#promisecid-repoblocksdeletecidcid)
    - [`AsyncIterator<CID> repo.blocks.deleteMany(source:AsyncIterable<CID>)`](#asynciteratorcid-repoblocksdeletemanysourceasynciterablecid)
  - [Datastore](#datastore)
    - [`repo.datastore`](#repodatastore)
  - [Config](#config)
    - [`Promise repo.config.set(key:String, value:Object)`](#promise-repoconfigsetkeystring-valueobject)
    - [`Promise repo.config.replace(value:Object)`](#promise-repoconfigreplacevalueobject)
    - [`Promise<?> repo.config.get(key:String)`](#promise-repoconfiggetkeystring)
    - [`Promise<Object> repo.config.getAll()`](#promiseobject-repoconfiggetall)
    - [`Promise<boolean> repo.config.exists()`](#promiseboolean-repoconfigexists)
  - [Version](#version)
    - [`Promise<Number> repo.version.get()`](#promisenumber-repoversionget)
    - [`Promise repo.version.set (version:Number)`](#promise-repoversionset-versionnumber)
  - [API Addr](#api-addr)
    - [`Promise<String> repo.apiAddr.get()`](#promisestring-repoapiaddrget)
    - [`Promise repo.apiAddr.set(value)`](#promise-repoapiaddrsetvalue)
  - [Status](#status)
    - [`Promise<Object> repo.stat()`](#promiseobject-repostat)
  - [Lock](#lock)
    - [`Promise lock.lock(dir)`](#promise-locklockdir)
    - [`Promise closer.close()`](#promise-closerclose)
    - [`Promise<boolean> lock.locked(dir)`](#promiseboolean-locklockeddir)
- [Notes](#notes)
  - [Migrations](#migrations)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i ipfs-repo
```

This is the implementation of the [IPFS repo spec](https://github.com/ipfs/specs/blob/master/REPO.md) in JavaScript.

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
            │   FsDatastore   │                                 │  IdbDatastore   │
            └─────────────────┘                                 └─────────────────┘
         ┌───────────┴───────────┐                           ┌───────────┴───────────┐
┌─────────────────┐     ┌─────────────────┐         ┌─────────────────┐     ┌─────────────────┐
│     /blocks     │     │   /datastore    │         │     /blocks     │     │   /datastore    │
├─────────────────┤     ├─────────────────┤         ├─────────────────┤     ├─────────────────┤
│ FlatfsDatastore │     │LevelDBDatastore │         │  IdbDatastore   │     │  IdbDatastore   │
└─────────────────┘     └─────────────────┘         └─────────────────┘     └─────────────────┘
```

This provides a well defined interface for creating and interacting with an IPFS repo.

```sh
> npm install ipfs-repo
```

```js
import { createRepo } from 'ipfs-repo'
```

## Usage

Example:

```js
import { createRepo } from 'ipfs-repo'

const repo = createRepo('/tmp/ipfs-repo')

await repo.init({ cool: 'config' })
await repo.open()
console.log('repo is ready')
```

This now has created the following structure, either on disk or as an in memory representation:

    ├── blocks
    │   ├── SHARDING
    │   └── _README
    ├── config
    ├── datastore
    ├── keys
    └── version

## API

### Setup

#### `createRepo(path[, options])`

Creates an IPFS Repo.

Arguments:

- `path` (string, mandatory): the path for this repo
- `options` (object, optional): may contain the following values
  - `autoMigrate` (bool, defaults to `true`): controls automatic migrations of repository.
  - `onMigrationProgress` (function(version, percentComplete, message)): callback function to be notified of migration progress
  - `lock` ([Lock](#lock) or string *Deprecated*): what type of lock to use. Lock has to be acquired when opening. string can be `"fs"` or `"memory"`.
  - `storageBackends` (object, optional): may contain the following values, which should each be a class implementing the [datastore interface](https://github.com/ipfs/interface-datastore#readme):
    - `root` (defaults to [`datastore-fs`](https://github.com/ipfs/js-datastore-fs#readme) in Node.js and [`datastore-level`](https://github.com/ipfs/js-datastore-level#readme) in the browser). Defines the back-end type used for gets and puts of values at the root (`repo.set()`, `repo.get()`)
    - `blocks` (defaults to [`datastore-fs`](https://github.com/ipfs/js-datastore-fs#readme) in Node.js and [`datastore-level`](https://github.com/ipfs/js-datastore-level#readme) in the browser). Defines the back-end type used for gets and puts of values at `repo.blocks`.
    - `keys` (defaults to [`datastore-fs`](https://github.com/ipfs/js-datastore-fs#readme) in Node.js and [`datastore-level`](https://github.com/ipfs/js-datastore-level#readme) in the browser). Defines the back-end type used for gets and puts of encrypted keys at `repo.keys`
    - `datastore` (defaults to [`datastore-level`](https://github.com/ipfs/js-datastore-level#readme)). Defines the back-end type used as the key-value store used for gets and puts of values at `repo.datastore`.

```js
const repo = createRepo('path/to/repo')
```

#### `Promise repo.init()`

Creates the necessary folder structure inside the repo

#### `Promise repo.open()`

[Locks](https://en.wikipedia.org/wiki/Record_locking) the repo to prevent conflicts arising from simultaneous access

#### `Promise repo.close()`

Unlocks the repo.

#### `Promise<boolean> repo.exists()`

Tells whether this repo exists or not. Returned promise resolves to a `boolean`

#### `Promise<Boolean> repo.isInitialized()`

The returned promise resolves to `false` if the repo has not been initialized and `true` if it has

### Repos

Root repo:

#### `Promise repo.put(key, value:Uint8Array)`

Put a value at the root of the repo

- `key` can be a Uint8Array, a string or a [Key][]

#### `Promise<Uint8Array> repo.get(key)`

Get a value at the root of the repo

- `key` can be a Uint8Array, a string or a [Key][]

### Blocks

#### `Promise<Block> repo.blocks.put(block:Block)`

- `block` should be of type [Block][]

#### `AsyncIterator<Block> repo.blocks.putMany(source:AsyncIterable<Block>)`

Put many blocks.

- `source` should be an AsyncIterable that yields entries of type [Block][]

#### `Promise<Block> repo.blocks.get(cid:CID)`

Get block.

- `cid` is the content id of type [CID][]

#### `AsyncIterable<Block> repo.blocks.getMany(source:AsyncIterable<CID>)`

Get many blocks

- `source` should be an AsyncIterable that yields entries of type [CID][]

#### `Promise<boolean> repo.blocks.has (cid:CID)`

Indicate if a block is present for the passed CID

- `cid` should be of the type [CID][]

#### `Promise<boolean> repo.blocks.delete (cid:CID)`

Deletes a block

- `cid` should be of the type [CID][]

#### `AsyncIterator<Block|CID> repo.blocks.query (query)`

Query what blocks are available in blockstore.

If `query.keysOnly` is true, the returned iterator will yield [CID][]s, otherwise it will yield [Block][]s

- `query` is a object as specified in [interface-datastore](https://github.com/ipfs/interface-datastore#query).

Datastore:

#### `Promise<CID> repo.blocks.delete(cid:CID)`

- `cid` should be of the type [CID][]

Delete a block

#### `AsyncIterator<CID> repo.blocks.deleteMany(source:AsyncIterable<CID>)`

- `source` should be an Iterable or AsyncIterable that yields entries of the type [CID][]

Delete many blocks

### Datastore

#### `repo.datastore`

This contains a full implementation of [the `interface-datastore` API](https://github.com/ipfs/interface-datastore#api).

### Config

Instead of using `repo.set('config')` this exposes an API that allows you to set and get a decoded config object, as well as, in a safe manner, change any of the config values individually.

#### `Promise repo.config.set(key:String, value:Object)`

Set a config value. `value` can be any object that is serializable to JSON.

- `key` is a string specifying the object path. Example:

```js
await repo.config.set('a.b.c', 'c value')
const config = await repo.config.get()
assert.equal(config.a.b.c, 'c value')
```

#### `Promise repo.config.replace(value:Object)`

Set the whole config value. `value` can be any object that is serializable to JSON.

#### `Promise<?> repo.config.get(key:String)`

Get a config value. Returned promise resolves to the same type that was set before.

- `key` is a string specifying the object path. Example:

```js
const value = await repo.config.get('a.b.c')
console.log('config.a.b.c = ', value)
```

#### `Promise<Object> repo.config.getAll()`

Get the entire config value.

#### `Promise<boolean> repo.config.exists()`

Whether the config sub-repo exists.

### Version

#### `Promise<Number> repo.version.get()`

Gets the repo version (an integer).

#### `Promise repo.version.set (version:Number)`

Sets the repo version

### API Addr

#### `Promise<String> repo.apiAddr.get()`

Gets the API address.

#### `Promise repo.apiAddr.set(value)`

Sets the API address.

- `value` should be a [Multiaddr][] or a String representing a valid one.

### Status

#### `Promise<Object> repo.stat()`

Gets the repo status.

Returned promise resolves to an `Object` with the following keys:

- `numObjects`
- `repoPath`
- `repoSize`
- `version`
- `storageMax`

### Lock

IPFS Repo comes with two built in locks: memory and fs. These can be imported via the following:

```js
import { FSLock } from 'ipfs-repo/locks/fs'  // Default in Node.js
import { MemoryLock } from 'ipfs-repo/locks/memory'  // Default in browser
```

You can also provide your own custom Lock. It must be an object with the following interface:

#### `Promise lock.lock(dir)`

Sets the lock if one does not already exist. If a lock already exists, should throw an error.

`dir` is a string to the directory the lock should be created at. The repo typically creates the lock at its root.

Returns `closer`, where `closer` has a `close` method for removing the lock.

#### `Promise closer.close()`

Closes the lock created by `lock.open`

If no error was thrown, the lock was successfully removed.

#### `Promise<boolean> lock.locked(dir)`

Checks the existence of the lock.

`dir` is the path to the directory to check for the lock. The repo typically checks for the lock at its root.

Returned promise resolves to a `boolean` indicating the existence of the lock.

## Notes

- [Explanation of how repo is structured](https://github.com/ipfs/js-ipfs-repo/pull/111#issuecomment-279948247)

### Migrations

When there is a new repo migration and the version of the repo is increased, don't
forget to propagate the changes into the test repo (`test/test-repo`).

**For tools that run mainly in the browser environment, be aware that disabling automatic
migrations leaves the user with no way to run the migrations because there is no CLI in the browser. In such
a case, you should provide a way to trigger migrations manually.**

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Contributions welcome! Please check out [the issues](https://github.com/ipfs/js-ipfs-repo/issues).

Also see our [contributing document](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for more information on how we work, and about contributing in general.

Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

[CID]: https://github.com/multiformats/js-cid

[Key]: https://github.com/ipfs/interface-datastore#keys

[Block]: https://github.com/ipld/js-ipld-block

[Multiaddr]: https://github.com/multiformats/js-multiaddr
