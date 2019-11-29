<a name="0.28.2"></a>
## [0.28.2](https://github.com/ipfs/js-ipfs-repo/compare/v0.28.1...v0.28.2) (2019-11-29)


### Bug Fixes

* pass backwards-compatible level-js options ([#215](https://github.com/ipfs/js-ipfs-repo/issues/215)) ([4bc4e8a](https://github.com/ipfs/js-ipfs-repo/commit/4bc4e8a))



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



