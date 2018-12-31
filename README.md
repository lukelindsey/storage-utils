# storage-utils

[![Build Status](https://travis-ci.org/lukelindsey/storage-utils.svg?branch=master)](https://travis-ci.org/lukelindsey/storage-utils)
[![Coverage Status](https://coveralls.io/repos/github/lukelindsey/storage-utils/badge.svg?branch=master)](https://coveralls.io/github/lukelindsey/storage-utils?branch=master)
[![Dev Dependencies](https://david-dm.org/lukelindsey/storage-utils/dev-status.svg)](https://david-dm.org/lukelindsey/storage-utils?type=dev)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/lukelindsey)

A set of functions that makes caching using the [Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface (localStorage, sessionStorage) easy. It's extremely lightweight, well tested, and comes with top-notch TypeScript definitions out of the box. Documentation generated from source found [here](https://lukelindsey.github.io/storage-utils/).

Features:
- Invalidation of cached items after a period of time when specified (simple using the conversion functions that are included)
- Stale data is passed back to the getData callback so that only 'new' data needs to be fetched over the network
- `useResolve` allows using a function that will optionally resolve twice. Once with the cached data, and then with the fetched data (if the cache has expired). This provides the best of both worlds (instantaneous render and showing fresh data from API after fetch completes), and is an excellent fit for React's `setState` or a function that mutates the correct piece of data in Vue. 

Example:
```js
// cache is never invalidated since we omitted a time to live but can be manually removed.
getOrAdd(localStorage, "some-unique-key", () => fetch("/api/items"))
```

## API

`getOrAdd`

`useResolve`

`convert[Days|Hours|Minutes|Seconds]ToMilliseconds`
