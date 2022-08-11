# ipfs-repo-migrations <!-- omit in toc -->

[![ipfs.io](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io)
[![IRC](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Discord](https://img.shields.io/discord/806902334369824788?style=flat-square)](https://discord.gg/ipfs)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipfs-repo.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-repo)
[![CI](https://img.shields.io/github/workflow/status/ipfs/js-ipfs-repo/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/ipfs/js-ipfs-repo/actions/workflows/js-test-and-release.yml)

> Migration framework for versioning of JS IPFS Repo

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Lead Maintainer <!-- omit in toc -->](#lead-maintainer----omit-in-toc---)
- [Background](#background)
  - [Use in Node.js](#use-in-nodejs)
  - [Use in a browser with browserify, webpack or any other bundler](#use-in-a-browser-with-browserify-webpack-or-any-other-bundler)
- [Usage](#usage)
- [API](#api)
  - [`.migrate(path, repoOptions, toVersion, {ignoreLock, onProgress, isDryRun}) -> Promise<void>`](#migratepath-repooptions-toversion-ignorelock-onprogress-isdryrun---promisevoid)
    - [`onProgress(version, percent, message)`](#onprogressversion-percent-message)
  - [`.revert(path, repoOptions, toVersion, {ignoreLock, onProgress, isDryRun}) -> Promise<void>`](#revertpath-repooptions-toversion-ignorelock-onprogress-isdryrun---promisevoid)
  - [`getLatestMigrationVersion() -> int`](#getlatestmigrationversion---int)
- [Creating a new migration](#creating-a-new-migration)
  - [Architecture of a migration](#architecture-of-a-migration)
    - [`.migrate(repoPath, repoOptions)`](#migraterepopath-repooptions)
    - [`.revert(repoPath, repoOptions)`](#revertrepopath-repooptions)
  - [Browser vs. NodeJS environments](#browser-vs-nodejs-environments)
  - [Guidelines](#guidelines)
  - [Integration with js-ipfs](#integration-with-js-ipfs)
  - [Tests](#tests)
  - [Empty migrations](#empty-migrations)
  - [Migrations matrix](#migrations-matrix)
  - [Migrations](#migrations)
    - [7](#7)
    - [8](#8)
    - [9](#9)
    - [10](#10)
- [Developer](#developer)
  - [Module versioning notes](#module-versioning-notes)
- [Contribute](#contribute)
- [License](#license)
- [Contribute](#contribute-1)

## Install

```console
$ npm i ipfs-repo-migrations
```

This package is inspired by the [go-ipfs repo migration tool](https://github.com/ipfs/fs-repo-migrations/)

## Lead Maintainer <!-- omit in toc -->

[Alex Potsides](http://github.com/achingbrain)

## Background

As js-ipfs evolves and new technologies, algorithms and data structures are incorporated it is necessary to
enable users to transition between versions. Different versions of js-ipfs may expect a different IPFS repo structure or content (see: [IPFS repo spec](https://github.com/ipfs/specs/blob/master/REPO.md), [JS implementation](https://github.com/ipfs/js-ipfs-repo) ).
So the IPFS repo is versioned, and this package provides a framework to create migrations to transition
from one version of IPFS repo to the next/previous version.

This framework:

- Handles locking/unlocking of repository
- Defines migrations API
- Executes and reports migrations in both directions: forward and backward
- Simplifies creation of new migrations
- Works on the browser too!

```sh
> npm install ipfs-repo-migrations
```

### Use in Node.js

```js
const migrations from 'ipfs-repo-migrations')
```

### Use in a browser with browserify, webpack or any other bundler

```js
const migrations from 'ipfs-repo-migrations')
```

## Usage

Example:

```js
const migrations from 'ipfs-repo-migrations')

const repoPath = 'some/repo/path'
const currentRepoVersion = 7
const latestVersion = migrations.getLatestMigrationVersion()
const repoOptions = {
  ... // the same storage backend/storage options passed to `ipfs-repo`
}

if(currentRepoVersion < latestVersion){
  // Old repo! Lets migrate to latest version!
  await migrations.migrate(repoPath, latestVersion, {
    repoOptions
  })
}
```

To migrate your repository using the CLI, see the [how to run migrations](./run.md) tutorial.

## API

### `.migrate(path, repoOptions, toVersion, {ignoreLock, onProgress, isDryRun}) -> Promise<void>`

Executes a forward migration to a specific version, or to the latest version if a specific version is not specified.

**Arguments:**

- `path` (string, mandatory) - path to the repo to be migrated
- `repoOptions` (object, mandatory) - options that are passed to migrations, that use them to construct the datastore. (options are the same as for IPFSRepo).
- `toVersion` (int, mandatory) - version to which the repo should be migrated.
- `options` (object, optional) - options for the migration
- `options.ignoreLock` (bool, optional) - if true will not lock the repo when applying migrations. Use with caution.
- `options.onProgress` (function, optional) - callback that is called during each migration to report progress.
- `options.isDryRun` (bool, optional) - flag that indicates if it is a dry run that should give the same output as running a migration but without making any actual changes.

#### `onProgress(version, percent, message)`

Signature of the progress callback.

**Arguments:**

- `migration` (object) - object of migration that just successfully finished running. See [Architecture of migrations](#architecture-of-migrations) for details.
- `counter` (int) - index of current migration.
- `totalMigrations` (int) - total count of migrations that will be run.

### `.revert(path, repoOptions, toVersion, {ignoreLock, onProgress, isDryRun}) -> Promise<void>`

Executes backward migration to a specific version.

**Arguments:**

- `path` (string, mandatory) - path to the repo to be reverted
- `repoOptions` (object, mandatory) - options that are passed to migrations, that use them to construct the datastore. (options are the same as for IPFSRepo).
- `toVersion` (int, mandatory) - version to which the repo should be reverted to.
- `options` (object, optional) - options for the reversion
- `options.ignoreLock` (bool, optional) - if true will not lock the repo when applying migrations. Use with caution.
- `options.onProgress` (function, optional) - callback that is called during each migration to report progress.
- `options.isDryRun` (bool, optional) - flag that indicates if it is a dry run that should give the same output as running a migration but without making any actual changes.

### `getLatestMigrationVersion() -> int`

Return the version of the latest migration.

## Creating a new migration

Migrations are one of those things that can be extremely painful on users. At the end of the day, we want users never to have to think about it. The process should be:

- SAFE. No data lost. Ever.
- Revertible. Tools must implement forward and backward (if possible) migrations.
- Tests. Migrations have to be well tested.
- To Spec. The tools must conform to the spec.

If your migration has several parts, it should be fail-proof enough that if one part of migration fails the previous changes
are reverted before propagating the error. If possible then the outcome should be consistent repo so it migration could
be run again.

### Architecture of a migration

All migrations are placed in the `/migrations` folder. Each folder there represents one migration that follows the migration
API.

All migrations are collected in `/migrations/index.js`, which should not be edited manually.

**The order of migrations is important and migrations must be sorted in ascending order**.

Each migration must follow this API. It must export an object in its `index.js` that has following properties:

- `version` (int) - Number that represents the version which the repo will migrate to (eg. `8` will move the repo to version 8).
- `description` (string) - Brief description of what the migrations does.
- `migrate` (function) - Function that performs the migration (see signature of this function below)
- `revert` (function) - If defined then this function will revert the migration to the previous version. Otherwise it is assumed that it is not possible to revert this migration.

#### `.migrate(repoPath, repoOptions)`

*Do not confuse this function with the `require('ipfs-repo-migrations').migrate()` function that drives the whole migration process!*

Arguments:

- `repoPath` (string) - absolute path to the root of the repo
- `repoOptions` (object, optional) - object containing `IPFSRepo` options, that should be used to construct a datastore instance.

#### `.revert(repoPath, repoOptions)`

*Do not confuse this function with the `require('ipfs-repo-migrations').revert()` function that drives the whole backward migration process!*

Arguments:

- `repoPath` (string) - path to the root of the repo
- `repoOptions` (object, optional) - object containing `IPFSRepo` options, that should be used to construct the datastore instance.

### Browser vs. NodeJS environments

The migration might need to perform specific tasks in browser or NodeJS environment. In such a case create
migration file `/migrations/migration-<number>/index_browser.js` which have to follow the same API is described before.
Then add entry in `package.json` to the `browser` field as follow:

    './migrations/migration-<number>/index.js': './migrations/migration-<number>/index_browser.js'

In browser environments then `index.js` will be replaced with `index_browser.js`.

Simple migrations should not need to distinguish between
these environments as the datastore implementation will handle the main differences.

There are currently two main datastore implementations:

1. [`datastore-fs`](https://github.com/ipfs/js-datastore-fs) that is backed by file system and is used mainly in the NodeJS environment
2. [`datastore-idb`](https://github.com/ipfs/js-datastore-idb) that is backed by LevelDB and is used mainly in the browser environment

Both implementations share the same API and hence are interchangeable.

When the migration is run in a browser environment, `datastore-fs` is automatically replaced with `datastore-idb` even
when it is directly imported (`require('datastore-fs')` will return `datastore-idb` in a browser).
So with simple migrations you shouldn't worry about the difference between `datastore-fs` and `datastore-idb`
and by default use the `datastore-fs` package (as the replace mechanism does not work vice versa).

### Guidelines

The recommended way to write a new migration is to first bootstrap a dummy migration using the CLI:

```sh
> npm run new-migration
```

A new folder is created with the bootstrapped migration. You can then simply fill in the required fields and
write the rest of the migration!

### Integration with js-ipfs

When a new migration is created, new version of this package have to be released. Afterwards version of this package in [`js-ipfs-repo`](https://github.com/ipfs/js-ipfs-repo) have to be updated
together with the repo version that `IPFSRepo` expects. Then the updated version of `js-ipfs-repo` should be propagated to `js-ipfs`.

### Tests

If a migration affects any of the following functionality, it must provide tests for the following functions
to work under the version of the repo that it migrates to:

- `/src/repo/version.js`:`getVersion()` - retrieving repository's version
- `/src/repo/lock.js`:`lock()` - locking repository that uses file system
- `/src/repo/lock-memory.js`:`lock()` - locking repository that uses memory

Every migration must have test coverage. Tests for migrations should be placed in the `/test/migrations/` folder. Most probably
you will have to plug the tests into `browser.js`/`node.js` if they require specific bootstrapping on each platform.

### Empty migrations

For interop with go-ipfs it might be necessary just to bump a version of a repo without any actual
modification as there might not be any changes needed in the JS implementation. For that purpose you can create an "empty migration".

The easiest way to do so is with the CLI:

```sh
> npm run new-migration -- --empty
```

This will create an empty migration with the next version.

### Migrations matrix

| IPFS repo version | JS IPFS version |
| ----------------: | :-------------: |
|                 7 |      v0.0.0     |
|                 8 |     v0.48.0     |
|                 9 |     v0.49.0     |

### Migrations

#### 7

This is the initial version of the datastore, inherited from go-IPFS in an attempt to maintain cross-compatibility between the two implementations.

#### 8

Blockstore keys are transformed into base32 representations of the multihash from the CID of the block.

#### 9

Pins were migrated from a DAG to a Datastore - see [ipfs/js-ipfs#2771](https://github.com/ipfs/js-ipfs/pull/2771)

#### 10

`level@6.x.x` upgrades the `level-js` dependency from `4.x.x` to `5.x.x`.  This update requires a database migration to convert all string keys/values into buffers. Only runs in the browser, node is unaffected. See [Level/level-js#179](https://github.com/Level/level-js/pull/179)

## Developer

### Module versioning notes

In order to have good overview of what version of package contains what kind of migration, to every release there
should be appended version's metadata in format `migr-<versionOfLatestMigration>`. If for releasing is used `aegir`
you can use the `release --metadata` option.

## Contribute

There are some ways you can make this module better:

- Consult our [open issues](https://github.com/ipfs/js-ipfs-repo/issues) and take on one of them
- Help our tests reach 100% coverage!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-unixfs-importer/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)
