# js-ipfs-repo

Implementation of the IPFS repo spec (https://github.com/ipfs/specs/tree/master/repo) in JavaScript

## API

### `Repo`

Constructor, accepts a path and options:

```js
var Repo = require('js-ipfs-repo')
var repo = new Repo('/Users/someone/.ipfs', {adaptor: 'fs'})
```

Options:

  - `adaptor`: String with the adaptor. Defaults to `fs`

### `#version`

Read/Write the version number of that repository.

```js
repo.version().read(function (err, num) {
  console.log(err, num) // => 2
})

repo.version().write(3, function (err) {
  console.log(err)
})
```

### `#api`

Read/Write the JSON configuration for that repository.

```js
repo.api().read(function (err, multiaddr) {
  console.log(err, multiaddr)
})

repo.api().write('/ip4/127.0.0.1/tcp/5001', function (err) {
  console.log(err)
})
```

### `#config`

Read/Write the JSON configuration for that repository.

```js
repo.config().read(function (err, json) {
  console.log(err, json)
})

repo.config().write({foo: 'bar'}, function (err) {
  console.log(err)
})
```

### `#logs`

Truncate/Append logs.

```js
repo.logs().truncate(function (err) {
  console.log(err)
})

repo.logs().log('error: not found', function (err) {
  console.log(err)
})
```

### `#repo`

Read/Write the `repo.lock` file.

```js
repo.repo().read(function (err, content) {
  console.log(err, content)
})

repo.repo().write('foo', function (err) {
  console.log(err)
})
```

## Adaptors

By default it will use the `fs` adaptor. Eventually we can write other adaptors
and make those available on configuration.

### `fs`

The default adaptor. Uses the `repo.lock` file to ensure there are no simultaneous reads
nor writes. Uses the `fs-blob-store`.

## Tests

Not there yet! Should ran both in node and in Phantom with compatible
adaptors.
