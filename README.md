# ipfs-repo <!-- omit in toc -->

[![ipfs.io](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io)
[![IRC](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Discord](https://img.shields.io/discord/806902334369824788?style=flat-square)](https://discord.gg/ipfs)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipfs-repo.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-repo)
[![CI](https://img.shields.io/github/workflow/status/ipfs/js-ipfs-repo/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/ipfs/js-ipfs-repo/actions/workflows/js-test-and-release.yml)

> The repo and migration tools used by IPFS

## Table of contents <!-- omit in toc -->

- [Structure](#structure)
- [Lead Maintainer <!-- omit in toc -->](#lead-maintainer----omit-in-toc---)
- [Development](#development)
  - [Publishing new versions](#publishing-new-versions)
  - [Using prerelease versions](#using-prerelease-versions)
- [Contribute](#contribute)
- [License](#license)
- [Contribute](#contribute-1)

## Structure

- [`/packages/ipfs-repo`](./packages/ipfs-repo) IPFS Repo implementation
- [`/packages/ipfs-repo-migrations`](./packages/ipfs-repo-migrations) Migration framework for versioning of JS IPFS Repo

## Lead Maintainer <!-- omit in toc -->

[Alex Potsides](https://github.com/achingbrain)

- [`/packages/ipfs-repo`](./packages/ipfs-repo) The repo implementation
- [`/packages/ipfs-repo-migrations`](./packages/ipfs-urepo-migrations) A tool for migrating between different repo versions

## Development

1. Clone this repo
2. Run `npm install`

This will install [lerna](https://www.npmjs.com/package/lerna) and bootstrap the various packages, deduping and hoisting dependencies into the root folder.

If later you wish to remove all the `node_modules`/`dist` folders and start again, run `npm run reset && npm install` from the root.

See the scripts section of the root [`package.json`](./package.json) for more commands.

### Publishing new versions

1. Ensure you have a `GH_TOKEN` env var containing a GitHub [Personal Access Token](https://github.com/settings/tokens) with `public_repo` permissions
2. From the root of this repo run `npm run release` and follow the on screen prompts.  It will use [conventional commits](https://www.conventionalcommits.org) to work out the new package version

### Using prerelease versions

Any changed packages from each successful build of master are published to npm as canary builds under the npm tag `next`.

Canary builds only consider changes to packages in the last built commit so changes to the root config files should not result in new prereleases being published to npm.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-repo/issues)!

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
