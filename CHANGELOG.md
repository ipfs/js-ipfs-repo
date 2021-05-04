## [9.1.6](https://github.com/ipfs/js-ipfs-repo/compare/v9.1.5...v9.1.6) (2021-05-04)



## [9.1.5](https://github.com/ipfs/js-ipfs-repo/compare/v9.1.4...v9.1.5) (2021-05-04)



## [9.1.4](https://github.com/ipfs/js-ipfs-repo/compare/v9.1.3...v9.1.4) (2021-05-04)


### Bug Fixes

* correct key name ([4f0194a](https://github.com/ipfs/js-ipfs-repo/commit/4f0194a65e0ca1ae125b25fe54babadeb1fc6a01))



## [9.1.3](https://github.com/ipfs/js-ipfs-repo/compare/v9.1.2...v9.1.3) (2021-04-29)


### Bug Fixes

* make announce and noannounce optional ([a7562d8](https://github.com/ipfs/js-ipfs-repo/commit/a7562d8e4fcd00e43c65728c48ae543998cde17f))



## [9.1.2](https://github.com/ipfs/js-ipfs-repo/compare/v9.1.1...v9.1.2) (2021-04-29)



## [9.1.1](https://github.com/ipfs/js-ipfs-repo/compare/v9.1.0...v9.1.1) (2021-04-22)



# [9.1.0](https://github.com/ipfs/js-ipfs-repo/compare/v9.0.0...v9.1.0) (2021-04-15)


### Features

* make blockstore identity-hash compatible ([#297](https://github.com/ipfs/js-ipfs-repo/issues/297)) ([bbcdb12](https://github.com/ipfs/js-ipfs-repo/commit/bbcdb1205832ba9bb4fd214c7d9e1c1125d48f18))



# [9.0.0](https://github.com/ipfs/js-ipfs-repo/compare/v8.0.0...v9.0.0) (2021-03-05)


### Features

* add types ([#275](https://github.com/ipfs/js-ipfs-repo/issues/275)) ([1f8ba76](https://github.com/ipfs/js-ipfs-repo/commit/1f8ba76c9408ba51199d87db062c0b3dc972657e))



# [8.0.0](https://github.com/ipfs/js-ipfs-repo/compare/v7.0.1...v8.0.0) (2021-01-29)



## [7.0.1](https://github.com/ipfs/js-ipfs-repo/compare/v7.0.0...v7.0.1) (2021-01-27)



# [7.0.0](https://github.com/ipfs/js-ipfs-repo/compare/v6.0.3...v7.0.0) (2020-11-06)


### chore

* update deps ([#263](https://github.com/ipfs/js-ipfs-repo/issues/263)) ([b61cfda](https://github.com/ipfs/js-ipfs-repo/commit/b61cfda5af5a3524472f2cbb4f7461a59defcf2f))


### BREAKING CHANGES

* updates ipld-block to 0.11.0 which is not compatible with earlier versions (fails `expect(v11Block).to.deep.equal(v10Block)` for example)



<a name="6.0.3"></a>
## [6.0.3](https://github.com/ipfs/js-ipfs-repo/compare/v6.0.2...v6.0.3) (2020-08-15)



<a name="6.0.2"></a>
## [6.0.2](https://github.com/ipfs/js-ipfs-repo/compare/v6.0.1...v6.0.2) (2020-08-15)


### Bug Fixes

* open datastores after migration ([#255](https://github.com/ipfs/js-ipfs-repo/issues/255)) ([712ed2a](https://github.com/ipfs/js-ipfs-repo/commit/712ed2a))


### Features

* expose onMigrationProgress option ([#254](https://github.com/ipfs/js-ipfs-repo/issues/254)) ([6166e1f](https://github.com/ipfs/js-ipfs-repo/commit/6166e1f))



<a name="6.0.1"></a>
## [6.0.1](https://github.com/ipfs/js-ipfs-repo/compare/v6.0.0...v6.0.1) (2020-08-06)



<a name="6.0.0"></a>
# [6.0.0](https://github.com/ipfs/js-ipfs-repo/compare/v5.0.0...v6.0.0) (2020-08-05)


### Bug Fixes

* swap node buffers for uint8arrays ([#249](https://github.com/ipfs/js-ipfs-repo/issues/249)) ([ea405b5](https://github.com/ipfs/js-ipfs-repo/commit/ea405b5))


### BREAKING CHANGES

* - Swaps out node `Buffer`s for `Uint8Array`s



<a name="5.0.0"></a>
# [5.0.0](https://github.com/ipfs/js-ipfs-repo/compare/v4.0.0...v5.0.0) (2020-07-21)


### Features

* store pins in datastore ([#221](https://github.com/ipfs/js-ipfs-repo/issues/221)) ([467c430](https://github.com/ipfs/js-ipfs-repo/commit/467c430))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/ipfs/js-ipfs-repo/compare/v3.0.3...v4.0.0) (2020-06-25)


### Features

* store blocks under multihash key ([#211](https://github.com/ipfs/js-ipfs-repo/issues/211)) ([06a9e27](https://github.com/ipfs/js-ipfs-repo/commit/06a9e27))


### BREAKING CHANGES

* - Repo version incremented to `8`, requires a migration
- Blocks are now stored using the multihash, not the full CID
- `repo.blocks.query({})` now returns an async iterator that yields blocks
- `repo.blocks.query({ keysOnly: true })` now returns an async iterator that yields CIDs
  - Those CIDs are v1 with the raw codec

Co-authored-by: achingbrain <alex@achingbrain.net>



<a name="3.0.3"></a>
## [3.0.3](https://github.com/ipfs/js-ipfs-repo/compare/v3.0.2...v3.0.3) (2020-06-20)



<a name="3.0.2"></a>
## [3.0.2](https://github.com/ipfs/js-ipfs-repo/compare/v3.0.1...v3.0.2) (2020-06-15)


### Features

* use datastore-level in the browser again ([#236](https://github.com/ipfs/js-ipfs-repo/issues/236)) ([33663b3](https://github.com/ipfs/js-ipfs-repo/commit/33663b3))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/ipfs/js-ipfs-repo/compare/v3.0.0...v3.0.1) (2020-05-19)


### Bug Fixes

* return blocks from putmany as blocks are passed in ([8c386c7](https://github.com/ipfs/js-ipfs-repo/commit/8c386c7))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/ipfs/js-ipfs-repo/compare/v2.1.1...v3.0.0) (2020-05-14)


### Features

* use streaming API for blockstore access ([#232](https://github.com/ipfs/js-ipfs-repo/issues/232)) ([65d7596](https://github.com/ipfs/js-ipfs-repo/commit/65d7596))


### BREAKING CHANGES

* * `repo.blockstore.putMany()` used to return a promise that resolved when all the deletes were done, now it returns an AsyncIterator that yields `{key, value}` objects as the put progresses
* `repo.blockstore.deleteMany()` used to return a promise that resolved when all the deletes were done, now it returns an AsyncIterator that yields CID objects as the delete progresses



<a name="2.1.1"></a>
## [2.1.1](https://github.com/ipfs/js-ipfs-repo/compare/v2.1.0...v2.1.1) (2020-05-05)



<a name="2.1.0"></a>
# [2.1.0](https://github.com/ipfs/js-ipfs-repo/compare/v2.0.1...v2.1.0) (2020-05-04)


### Bug Fixes

* **ci:** add empty commit to fix lint checks on master ([d1773b1](https://github.com/ipfs/js-ipfs-repo/commit/d1773b1))


### Features

* add deleteMany method ([#230](https://github.com/ipfs/js-ipfs-repo/issues/230)) ([3210db9](https://github.com/ipfs/js-ipfs-repo/commit/3210db9))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/ipfs/js-ipfs-repo/compare/v2.0.0...v2.0.1) (2020-04-28)


### Features

* adds .replace and .getAll methods to config ([#227](https://github.com/ipfs/js-ipfs-repo/issues/227)) ([0122537](https://github.com/ipfs/js-ipfs-repo/commit/0122537))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/ipfs/js-ipfs-repo/compare/v1.0.1...v2.0.0) (2020-04-20)


### Features

* use new datastore-idb ([#225](https://github.com/ipfs/js-ipfs-repo/issues/225)) ([99df42b](https://github.com/ipfs/js-ipfs-repo/commit/99df42b))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/ipfs/js-ipfs-repo/compare/v1.0.0...v1.0.1) (2020-03-30)



# [1.0.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.30.1...v1.0.0) (2020-02-10)


### Bug Fixes

* close root datastore after initialized check ([65f60d3](https://github.com/ipfs/js-ipfs-repo/commit/65f60d387aeee63d4787c91483d9ef0b02a31f9d))


### Features

* add isInitialized method ([0c016c5](https://github.com/ipfs/js-ipfs-repo/commit/0c016c5591b572f4ba86f861fcbbfb47dc5cb21e))



<a name="0.30.1"></a>
## [0.30.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.30.0...v0.30.1) (2019-11-29)


### Bug Fixes

* pass backwards-compatible level-js options ([#215](https://github.com/ipfs/js-ipfs-repo/issues/215)) ([6286167](https://github.com/ipfs/js-ipfs-repo/commit/6286167))



<a name="0.30.0"></a>
# [0.30.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.29.2...v0.30.0) (2019-11-27)


### Features

* remove options object from stat method ([#216](https://github.com/ipfs/js-ipfs-repo/issues/216)) ([0fb521c](https://github.com/ipfs/js-ipfs-repo/commit/0fb521c))



<a name="0.29.2"></a>
## [0.29.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.29.1...v0.29.2) (2019-11-19)


### Bug Fixes

* close root datastore ([#214](https://github.com/ipfs/js-ipfs-repo/issues/214)) ([72bae9d](https://github.com/ipfs/js-ipfs-repo/commit/72bae9d))



<a name="0.29.1"></a>
## [0.29.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.29.0...v0.29.1) (2019-11-14)


### Bug Fixes

* human readable option ([#213](https://github.com/ipfs/js-ipfs-repo/issues/213)) ([bf0f170](https://github.com/ipfs/js-ipfs-repo/commit/bf0f170))



<a name="0.29.0"></a>
# [0.29.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.28.1...v0.29.0) (2019-11-06)


### Features

* automatic repo migrations ([#202](https://github.com/ipfs/js-ipfs-repo/issues/202)) ([a0b6f95](https://github.com/ipfs/js-ipfs-repo/commit/a0b6f95))



<a name="0.28.1"></a>
## [0.28.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.28.0...v0.28.1) (2019-10-29)



<a name="0.28.0"></a>
# [0.28.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.27.1...v0.28.0) (2019-09-20)


### Features

* accept async iterators into blockstore.putMany ([#209](https://github.com/ipfs/js-ipfs-repo/issues/209)) ([9c06303](https://github.com/ipfs/js-ipfs-repo/commit/9c06303))


### BREAKING CHANGES

* you must pass an iterable or async iterable to putMany
- this should be relatively painless as the current API is to pass an
array which is iterable, but it does change the API.

* chore: remove CI commitlint
* chore: add node 12 to CI
* docs: update docs with new api



<a name="0.27.1"></a>
## [0.27.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.27.0...v0.27.1) (2019-08-21)


### Bug Fixes

* memlock throws error when lock exists ([#200](https://github.com/ipfs/js-ipfs-repo/issues/200)) ([79fb031](https://github.com/ipfs/js-ipfs-repo/commit/79fb031))


### Features

* export blockstore key encode/decode utils ([#206](https://github.com/ipfs/js-ipfs-repo/issues/206)) ([f83edae](https://github.com/ipfs/js-ipfs-repo/commit/f83edae)), closes [/github.com/ipfs/js-ipfs/pull/2022/files#r303389863](https://github.com//github.com/ipfs/js-ipfs/pull/2022/files/issues/r303389863)
* not found error for config values ([#201](https://github.com/ipfs/js-ipfs-repo/issues/201)) ([a8e5860](https://github.com/ipfs/js-ipfs-repo/commit/a8e5860))



<a name="0.27.0"></a>
# [0.27.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.26.6...v0.27.0) (2019-06-04)


### Features

* refactor/async await ([#199](https://github.com/ipfs/js-ipfs-repo/issues/199)) ([e6db5cf](https://github.com/ipfs/js-ipfs-repo/commit/e6db5cf))


### BREAKING CHANGES

* ipfs-repo has been refactored to use async/await. All callback support has been dropped. See the README for the new api.



<a name="0.26.6"></a>
## [0.26.6](https://github.com/ipfs/js-ipfs-repo/compare/v0.26.5...v0.26.6) (2019-05-13)



<a name="0.26.5"></a>
## [0.26.5](https://github.com/ipfs/js-ipfs-repo/compare/v0.26.4...v0.26.5) (2019-05-09)



<a name="0.26.4"></a>
## [0.26.4](https://github.com/ipfs/js-ipfs-repo/compare/v0.26.3...v0.26.4) (2019-03-18)


### Bug Fixes

* reduce bundle size ([#186](https://github.com/ipfs/js-ipfs-repo/issues/186)) ([0aa9d77](https://github.com/ipfs/js-ipfs-repo/commit/0aa9d77))



<a name="0.26.3"></a>
## [0.26.3](https://github.com/ipfs/js-ipfs-repo/compare/v0.26.2...v0.26.3) (2019-03-13)


### Bug Fixes

* update lock file package to fix compromised lock check ([#193](https://github.com/ipfs/js-ipfs-repo/issues/193)) ([73d95cd](https://github.com/ipfs/js-ipfs-repo/commit/73d95cd))



<a name="0.26.2"></a>
## [0.26.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.26.2-rc.0...v0.26.2) (2019-02-18)



<a name="0.26.2-rc.0"></a>
## [0.26.2-rc.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.26.1...v0.26.2-rc.0) (2019-02-14)



<a name="0.26.1"></a>
## [0.26.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.26.0...v0.26.1) (2019-01-15)


### Bug Fixes

* fix repo lock and buffer api ([#185](https://github.com/ipfs/js-ipfs-repo/issues/185)) ([f56aea3](https://github.com/ipfs/js-ipfs-repo/commit/f56aea3))



<a name="0.26.0"></a>
# [0.26.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.25.2...v0.26.0) (2018-12-07)


### Features

* cid agnostic blockstore .get and .has ([#184](https://github.com/ipfs/js-ipfs-repo/issues/184)) ([18cca08](https://github.com/ipfs/js-ipfs-repo/commit/18cca08))



<a name="0.25.2"></a>
## [0.25.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.25.1...v0.25.2) (2018-11-28)


### Bug Fixes

* fix staleness check ([#182](https://github.com/ipfs/js-ipfs-repo/issues/182)) ([ede5dd6](https://github.com/ipfs/js-ipfs-repo/commit/ede5dd6))



<a name="0.25.1"></a>
## [0.25.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.25.0...v0.25.1) (2018-11-19)


### Bug Fixes

* fix lock for node 11 ([#181](https://github.com/ipfs/js-ipfs-repo/issues/181)) ([bec2a5d](https://github.com/ipfs/js-ipfs-repo/commit/bec2a5d))



<a name="0.25.0"></a>
# [0.25.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.24.0...v0.25.0) (2018-10-26)



<a name="0.24.0"></a>
# [0.24.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.23.1...v0.24.0) (2018-09-20)



<a name="0.23.1"></a>
## [0.23.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.23.0...v0.23.1) (2018-08-09)


### Bug Fixes

* repo should not break-from-v6-to-v7 ([33eab19](https://github.com/ipfs/js-ipfs-repo/commit/33eab19))



<a name="0.23.0"></a>
# [0.23.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.22.1...v0.23.0) (2018-08-09)



<a name="0.22.1"></a>
## [0.22.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.22.0...v0.22.1) (2018-05-29)


### Bug Fixes

* expose errors to resolve need for antipattern require ([bf1fb9c](https://github.com/ipfs/js-ipfs-repo/commit/bf1fb9c))



<a name="0.22.0"></a>
# [0.22.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.21.0...v0.22.0) (2018-05-29)


### Bug Fixes

* upgrade datastores for node 10 ([#168](https://github.com/ipfs/js-ipfs-repo/issues/168)) ([bd8a930](https://github.com/ipfs/js-ipfs-repo/commit/bd8a930))



<a name="0.21.0"></a>
# [0.21.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.20.1...v0.21.0) (2018-05-06)



<a name="0.20.1"></a>
## [0.20.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.20.0...v0.20.1) (2018-05-05)


### Features

* add uniform error to isInitialized ([755b5c6](https://github.com/ipfs/js-ipfs-repo/commit/755b5c6))



<a name="0.20.0"></a>
# [0.20.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.19.0...v0.20.0) (2018-04-23)


### Bug Fixes

* fix tests for ci ([d1457cd](https://github.com/ipfs/js-ipfs-repo/commit/d1457cd))


### Features

* **lock:** allow for custom lock ([c97db6c](https://github.com/ipfs/js-ipfs-repo/commit/c97db6c))



<a name="0.19.0"></a>
# [0.19.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.18.7...v0.19.0) (2018-04-10)



<a name="0.18.7"></a>
## [0.18.7](https://github.com/ipfs/js-ipfs-repo/compare/v0.18.6...v0.18.7) (2018-01-30)


### Features

* implement .stat function ([#159](https://github.com/ipfs/js-ipfs-repo/issues/159)) ([bd522ee](https://github.com/ipfs/js-ipfs-repo/commit/bd522ee))



<a name="0.18.6"></a>
## [0.18.6](https://github.com/ipfs/js-ipfs-repo/compare/v0.18.5...v0.18.6) (2018-01-27)


### Features

* export the current repo version. ([#158](https://github.com/ipfs/js-ipfs-repo/issues/158)) ([106b651](https://github.com/ipfs/js-ipfs-repo/commit/106b651))



<a name="0.18.5"></a>
## [0.18.5](https://github.com/ipfs/js-ipfs-repo/compare/v0.18.4...v0.18.5) (2017-12-11)


### Bug Fixes

* keys is a standard interface-datastore ([#156](https://github.com/ipfs/js-ipfs-repo/issues/156)) ([d99f3c4](https://github.com/ipfs/js-ipfs-repo/commit/d99f3c4))



<a name="0.18.4"></a>
## [0.18.4](https://github.com/ipfs/js-ipfs-repo/compare/v0.18.3...v0.18.4) (2017-12-05)


### Features

* keystore ([#155](https://github.com/ipfs/js-ipfs-repo/issues/155)) ([27df24d](https://github.com/ipfs/js-ipfs-repo/commit/27df24d))



<a name="0.18.3"></a>
## [0.18.3](https://github.com/ipfs/js-ipfs-repo/compare/v0.18.2...v0.18.3) (2017-11-08)



<a name="0.18.2"></a>
## [0.18.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.18.1...v0.18.2) (2017-11-06)


### Bug Fixes

* more windows interop ([#147](https://github.com/ipfs/js-ipfs-repo/issues/147)) ([22590cb](https://github.com/ipfs/js-ipfs-repo/commit/22590cb))



<a name="0.18.1"></a>
## [0.18.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.18.0...v0.18.1) (2017-11-06)



<a name="0.18.0"></a>
# [0.18.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.17.0...v0.18.0) (2017-11-04)


### Bug Fixes

* remove unused multiaddr dependency ([#143](https://github.com/ipfs/js-ipfs-repo/issues/143)) ([72b74ce](https://github.com/ipfs/js-ipfs-repo/commit/72b74ce))


### Features

* Windows interop ([#146](https://github.com/ipfs/js-ipfs-repo/issues/146)) ([fc66c06](https://github.com/ipfs/js-ipfs-repo/commit/fc66c06))



<a name="0.17.0"></a>
# [0.17.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.15.0...v0.17.0) (2017-07-23)


### Bug Fixes

* the prune of webcrypto-ossl ([b5187e7](https://github.com/ipfs/js-ipfs-repo/commit/b5187e7))



<a name="0.15.0"></a>
# [0.15.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.14.0...v0.15.0) (2017-07-04)



<a name="0.14.0"></a>
# [0.14.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.13.2...v0.14.0) (2017-06-27)


### Bug Fixes

* add backwards compatibility and more tests ([#138](https://github.com/ipfs/js-ipfs-repo/issues/138)) ([60e0da7](https://github.com/ipfs/js-ipfs-repo/commit/60e0da7))



<a name="0.13.2"></a>
## [0.13.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.13.1...v0.13.2) (2017-06-04)


### Bug Fixes

* remove the extensions .data that got introduced by [#136](https://github.com/ipfs/js-ipfs-repo/issues/136) ([1c80df2](https://github.com/ipfs/js-ipfs-repo/commit/1c80df2))



<a name="0.13.1"></a>
## [0.13.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.13.0...v0.13.1) (2017-05-23)



<a name="0.13.0"></a>
# [0.13.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.12.0...v0.13.0) (2017-03-23)


### Bug Fixes

* use open method and fork of level-js ([#128](https://github.com/ipfs/js-ipfs-repo/issues/128)) ([a8f59c4](https://github.com/ipfs/js-ipfs-repo/commit/a8f59c4))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.11.3...v0.12.0) (2017-03-21)


### Features

* migrate to datastore from pull-blob-store ([5872e31](https://github.com/ipfs/js-ipfs-repo/commit/5872e31))



<a name="0.11.3"></a>
## [0.11.3](https://github.com/ipfs/js-ipfs-repo/compare/v0.11.2...v0.11.3) (2017-02-09)


### Features

* change window to self for webworker support ([0f0d686](https://github.com/ipfs/js-ipfs-repo/commit/0f0d686))



<a name="0.11.2"></a>
## [0.11.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.11.1...v0.11.2) (2016-12-12)


### Bug Fixes

* example ([c2c76d7](https://github.com/ipfs/js-ipfs-repo/commit/c2c76d7))



<a name="0.11.1"></a>
## [0.11.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.11.0...v0.11.1) (2016-11-07)



<a name="0.11.0"></a>
# [0.11.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.10.0...v0.11.0) (2016-11-03)



<a name="0.10.0"></a>
# [0.10.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.9.1...v0.10.0) (2016-10-26)


### Features

* blockstore gets blockBlobs instead of blocks (the difference is that now it receives the key in which it should store it ([f7e4047](https://github.com/ipfs/js-ipfs-repo/commit/f7e4047))
* no optional extension + simplify some of blockstore code ([311551a](https://github.com/ipfs/js-ipfs-repo/commit/311551a))



<a name="0.9.1"></a>
## [0.9.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.9.0...v0.9.1) (2016-09-12)


### Bug Fixes

* **blockstore:** lock getStream to avoid race issues ([d12086e](https://github.com/ipfs/js-ipfs-repo/commit/d12086e))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.8.0...v0.9.0) (2016-09-08)


### Features

* **pull + api:** migration to pull streams + rename datastore -> ([08e68b3](https://github.com/ipfs/js-ipfs-repo/commit/08e68b3))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.7.5...v0.8.0) (2016-05-05)


### Bug Fixes

* follow abstract-blob-store interface for exists calls ([6abd0f5](https://github.com/ipfs/js-ipfs-repo/commit/6abd0f5))



<a name="0.7.5"></a>
## [0.7.5](https://github.com/ipfs/js-ipfs-repo/compare/v0.7.4...v0.7.5) (2016-05-02)



<a name="0.7.4"></a>
## [0.7.4](https://github.com/ipfs/js-ipfs-repo/compare/v0.7.3...v0.7.4) (2016-04-30)



<a name="0.7.3"></a>
## [0.7.3](https://github.com/ipfs/js-ipfs-repo/compare/v0.7.2...v0.7.3) (2016-04-30)



<a name="0.7.2"></a>
## [0.7.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.7.1...v0.7.2) (2016-04-30)



<a name="0.7.1"></a>
## [0.7.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.7.0...v0.7.1) (2016-04-27)



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.6.6...v0.7.0) (2016-04-26)



<a name="0.6.6"></a>
## [0.6.6](https://github.com/ipfs/js-ipfs-repo/compare/v0.6.5...v0.6.6) (2016-04-24)



<a name="0.6.5"></a>
## [0.6.5](https://github.com/ipfs/js-ipfs-repo/compare/v0.6.4...v0.6.5) (2016-04-24)


### Bug Fixes

* **datastore:** keep locks on writes ([a9c48e4](https://github.com/ipfs/js-ipfs-repo/commit/a9c48e4))



<a name="0.6.4"></a>
## [0.6.4](https://github.com/ipfs/js-ipfs-repo/compare/v0.6.3...v0.6.4) (2016-04-21)



<a name="0.6.3"></a>
## [0.6.3](https://github.com/ipfs/js-ipfs-repo/compare/v0.6.2...v0.6.3) (2016-04-20)


### Features

* Expose repo.path ([35c5155](https://github.com/ipfs/js-ipfs-repo/commit/35c5155))



<a name="0.6.2"></a>
## [0.6.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.5.3...v0.6.2) (2016-04-20)


### Bug Fixes

* Ensure callbacks are only called once ([3a469d5](https://github.com/ipfs/js-ipfs-repo/commit/3a469d5))



<a name="0.5.3"></a>
## [0.5.3](https://github.com/ipfs/js-ipfs-repo/compare/v0.5.2...v0.5.3) (2016-03-20)


### Bug Fixes

* Upgrade dependencies, use strict and fix /blocks pathing ([390f8b4](https://github.com/ipfs/js-ipfs-repo/commit/390f8b4))



<a name="0.5.2"></a>
## [0.5.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.5.1...v0.5.2) (2016-03-19)



<a name="0.5.1"></a>
## [0.5.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.5.0...v0.5.1) (2016-01-28)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.4.1...v0.5.0) (2016-01-27)


### Bug Fixes

* **stores:** Always coerce to a string before trying to parse ([1070395](https://github.com/ipfs/js-ipfs-repo/commit/1070395))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/ipfs/js-ipfs-repo/compare/v0.4.0...v0.4.1) (2016-01-21)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.3.2...v0.4.0) (2016-01-21)



<a name="0.3.2"></a>
## [0.3.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.3.0...v0.3.2) (2016-01-18)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.2.2...v0.3.0) (2016-01-15)



<a name="0.2.2"></a>
## [0.2.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.2.0...v0.2.2) (2016-01-06)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/js-ipfs-repo/compare/v0.1.0...v0.2.0) (2015-12-12)



<a name="0.1.0"></a>
# 0.1.0 (2015-12-10)



