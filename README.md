# storage-utils

[![Build Status](https://travis-ci.org/lukelindsey/storage-utils.svg?branch=master)](https://travis-ci.org/lukelindsey/storage-utils)
[![Coverage Status](https://coveralls.io/repos/github/lukelindsey/storage-utils/badge.svg?branch=master)](https://coveralls.io/github/lukelindsey/storage-utils?branch=master)
[![Dev Dependencies](https://david-dm.org/lukelindsey/storage-utils/dev-status.svg)](https://david-dm.org/lukelindsey/storage-utils?type=dev)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/lukelindsey)

`storage-utils` is a set of functions that makes caching using the [Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface (localStorage, sessionStorage) quite easy. It optionally invalidates items from the cache after a specified time, and even can provide access to the stale data in cache you want to fetch only the 'new' data along with other features. It's extremely lightweight, well tested, and comes with top-notch TypeScript definitions out of the box. Documentation generated from source found [here](https://lukelindsey.github.io/storage-utils/).

Simple example:
```js
// cache is never invalidated since we omitted a time to live but can be manually removed.
getOrAdd(localStorage, "some-unique-key", () => fetch("/api/items"))
```

## API

`getOrAdd`

`useResolve`

`convert[Days|Hours|Minutes|Seconds]ToMilliseconds`
