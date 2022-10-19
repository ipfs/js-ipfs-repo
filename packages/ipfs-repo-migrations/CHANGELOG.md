## [ipfs-repo-migrations-v14.0.0](https://github.com/ipfs/js-ipfs-repo/compare/ipfs-repo-migrations-v13.0.3...ipfs-repo-migrations-v14.0.0) (2022-10-19)


### ⚠ BREAKING CHANGES

* update multiformats to 10.x.x and all @ipld/* deps (#425)

### Dependencies

* update multiformats to 10.x.x and all @ipld/* deps ([#425](https://github.com/ipfs/js-ipfs-repo/issues/425)) ([d07db37](https://github.com/ipfs/js-ipfs-repo/commit/d07db37aef2c037916ada7cbd87730cdffbf6784))


### Documentation

* update readmes ([eb890b7](https://github.com/ipfs/js-ipfs-repo/commit/eb890b79f337c50ed9bc7241e51675c5a664b621))

## [ipfs-repo-migrations-v13.0.3](https://github.com/ipfs/js-ipfs-repo/compare/ipfs-repo-migrations-v13.0.2...ipfs-repo-migrations-v13.0.3) (2022-09-21)


### Bug Fixes

* OOM on large DAGs ([#410](https://github.com/ipfs/js-ipfs-repo/issues/410)) ([336d0b9](https://github.com/ipfs/js-ipfs-repo/commit/336d0b9a4b93dad11674a4af4acaca5541bcce40))


### Dependencies

* update @multiformats/multiaddr to 11.0.0 ([#411](https://github.com/ipfs/js-ipfs-repo/issues/411)) ([f7b34eb](https://github.com/ipfs/js-ipfs-repo/commit/f7b34eb5c46141baa7e8f4a752c15adbd6c70bc6))

## [ipfs-repo-migrations-v13.0.2](https://github.com/ipfs/js-ipfs-repo/compare/ipfs-repo-migrations-v13.0.1...ipfs-repo-migrations-v13.0.2) (2022-08-14)


### Dependencies

* update interface-datastore and friends ([#409](https://github.com/ipfs/js-ipfs-repo/issues/409)) ([1c42f42](https://github.com/ipfs/js-ipfs-repo/commit/1c42f42541fea316833555ea6cc8ade86aea9c48))

## [ipfs-repo-migrations-v13.0.1](https://github.com/ipfs/js-ipfs-repo/compare/ipfs-repo-migrations-v13.0.0...ipfs-repo-migrations-v13.0.1) (2022-08-11)


### Bug Fixes

* update config ([1772185](https://github.com/ipfs/js-ipfs-repo/commit/1772185fe81418598beb77e768834c31ab1c09c2))

## [ipfs-repo-migrations-v13.0.0](https://github.com/ipfs/js-ipfs-repo/compare/ipfs-repo-migrations-v12.0.1...ipfs-repo-migrations-v13.0.0) (2022-08-11)


### ⚠ BREAKING CHANGES

* this module used to be dual published as CJS/ESM now it is just ESM

### Dependencies

* update aegir to 37.x.x ([#400](https://github.com/ipfs/js-ipfs-repo/issues/400)) ([7bdc912](https://github.com/ipfs/js-ipfs-repo/commit/7bdc9124c18c9a4792295704cac25510d4694b46))
* update all deps ([#401](https://github.com/ipfs/js-ipfs-repo/issues/401)) ([9218212](https://github.com/ipfs/js-ipfs-repo/commit/9218212a67963c31efd4c2a3223d249f249406bc))


### Trivial Changes

* fix release script ([#404](https://github.com/ipfs/js-ipfs-repo/issues/404)) ([b2610d6](https://github.com/ipfs/js-ipfs-repo/commit/b2610d6b63274325422208c5730503992b002608))

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [12.0.1](https://github.com/ipfs/js-ipfs-repo/compare/ipfs-repo-migrations@12.0.0...ipfs-repo-migrations@12.0.1) (2022-01-19)


### Bug Fixes

* remove console output from migration ([#376](https://github.com/ipfs/js-ipfs-repo/issues/376)) ([b383845](https://github.com/ipfs/js-ipfs-repo/commit/b3838457984a61582b8857fcf63ec133ce74e1bb))





# [12.0.0](https://github.com/ipfs/js-ipfs-repo/compare/ipfs-repo-migrations@11.0.2...ipfs-repo-migrations@12.0.0) (2022-01-18)


### Features

* libp2p async peerstore migration ([#375](https://github.com/ipfs/js-ipfs-repo/issues/375)) ([5c9eb4b](https://github.com/ipfs/js-ipfs-repo/commit/5c9eb4b135687b27865e9929405e50d730524aa6))


### BREAKING CHANGES

* updates repo version and migrates repo





## [11.0.2](https://github.com/ipfs/js-ipfs-repo/compare/ipfs-repo-migrations@11.0.1...ipfs-repo-migrations@11.0.2) (2021-11-24)

**Note:** Version bump only for package ipfs-repo-migrations





## [11.0.1](https://github.com/ipfs/js-ipfs-repo/compare/ipfs-repo-migrations@11.0.0...ipfs-repo-migrations@11.0.1) (2021-09-15)

**Note:** Version bump only for package ipfs-repo-migrations





# 11.0.0 (2021-09-10)


### chore

* switch to esm ([#339](https://github.com/ipfs/js-ipfs-repo/issues/339)) ([8d673ba](https://github.com/ipfs/js-ipfs-repo/commit/8d673ba72c599259110c09e90353f05473f05616))


### BREAKING CHANGES

* only named exports are used, deep imports/requires are not possible





# [10.0.0](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v9.0.1...v10.0.0) (2021-08-23)


### Bug Fixes

* use new s3 instance for every test ([#124](https://github.com/ipfs/js-ipfs-repo-migrations/issues/124)) ([d3c0056](https://github.com/ipfs/js-ipfs-repo-migrations/commit/d3c0056160d7592da5d89e57f9d9faefa1fadd7d))


### Features

* migrate mfs root to datastore ([#126](https://github.com/ipfs/js-ipfs-repo-migrations/issues/126)) ([540a077](https://github.com/ipfs/js-ipfs-repo-migrations/commit/540a077528037f00468c09fc15a9f190de283967))


### BREAKING CHANGES

* adds a new migration, should go out as a major



## [9.0.1](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v9.0.0...v9.0.1) (2021-07-30)


### Bug Fixes

* remove optional chaining ([#122](https://github.com/ipfs/js-ipfs-repo-migrations/issues/122)) ([242dc8e](https://github.com/ipfs/js-ipfs-repo-migrations/commit/242dc8efcb5e612f01d4d8a6788d9640f21e2325))



# [9.0.0](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v8.0.0...v9.0.0) (2021-07-07)


### chore

* upgrade to new multiformats module ([#98](https://github.com/ipfs/js-ipfs-repo-migrations/issues/98)) ([dad30b6](https://github.com/ipfs/js-ipfs-repo-migrations/commit/dad30b6cd4f3067a1ed86b0971d84b26f42667ce))


### BREAKING CHANGES

* Uses new CID class

Co-authored-by: Rod Vagg <rod@vagg.org>



# [8.0.0](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v7.0.3...v8.0.0) (2021-04-15)



## [7.0.3](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v7.0.2...v7.0.3) (2021-03-21)


### Bug Fixes

* remove hacks from build and test ([#82](https://github.com/ipfs/js-ipfs-repo-migrations/issues/82)) ([18c0793](https://github.com/ipfs/js-ipfs-repo-migrations/commit/18c07937013dd95c53e38bb775aeb44b5eb75bcb))



## [7.0.2](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v7.0.1...v7.0.2) (2021-03-15)



## [7.0.1](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v7.0.0...v7.0.1) (2021-03-04)


### Bug Fixes

* add cborg to browser field ([#76](https://github.com/ipfs/js-ipfs-repo-migrations/issues/76)) ([8d6c65d](https://github.com/ipfs/js-ipfs-repo-migrations/commit/8d6c65d75dea367ffeb54d891106211abef68da3))



# [7.0.0](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v6.0.0...v7.0.0) (2021-03-04)


### Features

* add types ([#66](https://github.com/ipfs/js-ipfs-repo-migrations/issues/66)) ([349f3c8](https://github.com/ipfs/js-ipfs-repo-migrations/commit/349f3c842019edfbaed70fa3642fb280359a5aab))


### BREAKING CHANGES

* where there were previously no types, now there are types



# [6.0.0](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v5.0.6...v6.0.0) (2021-01-29)


### Features

* migration 10 to allow upgrading level in the browser ([#59](https://github.com/ipfs/js-ipfs-repo-migrations/issues/59)) ([7dc562b](https://github.com/ipfs/js-ipfs-repo-migrations/commit/7dc562b05eeeaa8db2de5a95a4b3bcbab6f17d5c)), closes [Level/level-js#179](https://github.com/Level/level-js/issues/179)



## [5.0.6](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v5.0.5...v5.0.6) (2021-01-27)



<a name="5.0.5"></a>
## [5.0.5](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v5.0.4...v5.0.5) (2020-08-17)


### Bug Fixes

* migrate empty repos ([#35](https://github.com/ipfs/js-ipfs-repo-migrations/issues/35)) ([e48efad](https://github.com/ipfs/js-ipfs-repo-migrations/commit/e48efad))



<a name="5.0.4"></a>
## [5.0.4](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v5.0.3...v5.0.4) (2020-08-15)


### Bug Fixes

* only count migrated blocks ([d49f338](https://github.com/ipfs/js-ipfs-repo-migrations/commit/d49f338))



<a name="5.0.3"></a>
## [5.0.3](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v5.0.2...v5.0.3) (2020-08-15)


### Bug Fixes

* pass repo options when migration error occurs ([267e718](https://github.com/ipfs/js-ipfs-repo-migrations/commit/267e718))



<a name="5.0.2"></a>
## [5.0.2](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v5.0.1...v5.0.2) (2020-08-15)


### Bug Fixes

* null-guard progress and enable migration 9 ([#34](https://github.com/ipfs/js-ipfs-repo-migrations/issues/34)) ([a42e671](https://github.com/ipfs/js-ipfs-repo-migrations/commit/a42e671))



<a name="5.0.1"></a>
## [5.0.1](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v5.0.0...v5.0.1) (2020-08-15)


### Bug Fixes

* root is not a store inside the store ([e4c9a9f](https://github.com/ipfs/js-ipfs-repo-migrations/commit/e4c9a9f))



<a name="5.0.0"></a>
# [5.0.0](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v4.0.0...v5.0.0) (2020-08-15)


### Features

* report migration progress ([#33](https://github.com/ipfs/js-ipfs-repo-migrations/issues/33)) ([051c0a4](https://github.com/ipfs/js-ipfs-repo-migrations/commit/051c0a4)), closes [#32](https://github.com/ipfs/js-ipfs-repo-migrations/issues/32)


### BREAKING CHANGES

* - The signature of the `onProgress` callback has changed



<a name="4.0.0"></a>
# [4.0.0](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v3.0.0...v4.0.0) (2020-08-06)


### Bug Fixes

* require passing repo options to migrator ([#31](https://github.com/ipfs/js-ipfs-repo-migrations/issues/31)) ([725f821](https://github.com/ipfs/js-ipfs-repo-migrations/commit/725f821))


### BREAKING CHANGES

* - `migrator.migrate(path, version, opts)` has changed to `migrator.migrate(path, repoOpts, version, opts)`
- `migrator.revert(path, version, opts)` has changed to `migrator.revert(path, repoOpts, version, opts)`



<a name="3.0.0"></a>
# [3.0.0](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v2.0.1...v3.0.0) (2020-08-05)


### Bug Fixes

* replace node buffers with uint8arrays ([#25](https://github.com/ipfs/js-ipfs-repo-migrations/issues/25)) ([1e7592d](https://github.com/ipfs/js-ipfs-repo-migrations/commit/1e7592d))


### BREAKING CHANGES

* - node `Buffer`s have been replaced with `Uint8Array`s



<a name="2.0.1"></a>
## [2.0.1](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v2.0.0...v2.0.1) (2020-07-21)


### Bug Fixes

* make recursive pins depth infinity ([ef95579](https://github.com/ipfs/js-ipfs-repo-migrations/commit/ef95579))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v1.0.0...v2.0.0) (2020-07-21)


### Features

* add migration 9 to migrate pins to the datastore and back ([#15](https://github.com/ipfs/js-ipfs-repo-migrations/issues/15)) ([2b14578](https://github.com/ipfs/js-ipfs-repo-migrations/commit/2b14578))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v0.2.2...v1.0.0) (2020-06-25)



<a name="0.2.2"></a>
## [0.2.2](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v0.2.1...v0.2.2) (2020-06-23)


### Bug Fixes

* **ci:** add empty commit to fix lint checks on master ([cf10410](https://github.com/ipfs/js-ipfs-repo-migrations/commit/cf10410))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v0.2.0...v0.2.1) (2020-04-28)


### Bug Fixes

* linter ([2a20542](https://github.com/ipfs/js-ipfs-repo-migrations/commit/2a20542))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v0.1.1+migr-7...v0.2.0) (2020-04-14)


### Bug Fixes

* remove datastore-level from the readme and deps ([dabab4e](https://github.com/ipfs/js-ipfs-repo-migrations/commit/dabab4e))
* remove node globals ([8b51f8d](https://github.com/ipfs/js-ipfs-repo-migrations/commit/8b51f8d))
* update datastore-idb ([3dc05ef](https://github.com/ipfs/js-ipfs-repo-migrations/commit/3dc05ef))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipfs/js-ipfs-repo-migrations/compare/v0.1.0+migr-7...v0.1.1) (2019-11-09)


### Bug Fixes

* provide empty migrations for all previous versions ([6ecba01](https://github.com/ipfs/js-ipfs-repo-migrations/commit/6ecba01))
* validate presence for all migrations in a range ([076f300](https://github.com/ipfs/js-ipfs-repo-migrations/commit/076f300))



<a name="0.1.0"></a>
# 0.1.0 (2019-11-06)


### Bug Fixes

* async lock-mem ([bc88612](https://github.com/ipfs/js-ipfs-repo-migrations/commit/bc88612))
* details ([93e0c86](https://github.com/ipfs/js-ipfs-repo-migrations/commit/93e0c86))
* removing staleness in lock ([e92d057](https://github.com/ipfs/js-ipfs-repo-migrations/commit/e92d057))
* update src/utils.js ([662d89b](https://github.com/ipfs/js-ipfs-repo-migrations/commit/662d89b))


### Features

* confirm migration of irreversible migrations ([9477d57](https://github.com/ipfs/js-ipfs-repo-migrations/commit/9477d57))
* empty 7-th migration ([dc886f0](https://github.com/ipfs/js-ipfs-repo-migrations/commit/dc886f0))
* initial implementation ([#1](https://github.com/ipfs/js-ipfs-repo-migrations/issues/1)) ([aae9aec](https://github.com/ipfs/js-ipfs-repo-migrations/commit/aae9aec))
* release metadata mentioned in README ([cf2409a](https://github.com/ipfs/js-ipfs-repo-migrations/commit/cf2409a))
* require toVersion in migrate() ([1596dfe](https://github.com/ipfs/js-ipfs-repo-migrations/commit/1596dfe))
* using browser field for browsers environment ([1474d5e](https://github.com/ipfs/js-ipfs-repo-migrations/commit/1474d5e))
