# storage-utils

[![Build Status](https://travis-ci.org/lukelindsey/storage-utils.svg?branch=master)](https://travis-ci.org/lukelindsey/storage-utils)
[![Coverage Status](https://coveralls.io/repos/github/lukelindsey/storage-utils/badge.svg?branch=master)](https://coveralls.io/github/lukelindsey/storage-utils?branch=master)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/lukelindsey)

A set of functions that makes caching using the [Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface (localStorage, sessionStorage) easy. It's extremely lightweight, well tested, and comes with top-notch TypeScript definitions out of the box. Documentation generated from source found [here](https://lukelindsey.github.io/storage-utils/).

### Features

- **New** Reach hook for seamless caching
- Invalidation of cached items after a period of time when specified (simple using the conversion functions that are included)
- Stale data is passed back to the getData callback so that only 'new' data needs to be fetched over the network
- `getHighlyAvailable` allows using a function that will optionally resolve twice. Once with the cached data, and then with the fetched data (if the cache has expired).

### API

[link](https://lukelindsey.github.io/storage-utils/)

### Examples

#### Barebones

```js
getOrAdd(
    localStorage,
    "someUniqueKey",
    fetchItems,
    convertMinutesToMilliseconds(5) // considered valid for 5 minutes
  ).then((items) => {
    // data here is either coming from the cache or the fetch we provided
    console.log(items);
  });
```

#### React Caching Hook
```js
import React from "react";
import { useCache, convertMinutesToMilliseconds } from "storage-utils";
import { get } from "./RestClient"; // not in this library

const url = `/api/name`;
const fetchName = () => get<string>(url);

export function Name() {
  // 
  let name = useCache(
    localStorage, // localStorage will save across browser sessions
    url, // using the url as a cache key, but this depends on the use
    fetchName, // can be anything that returns a promise of something
    0 // 
  );

  // loading will only ever be shown the very first time
  // since we are using the option to use the expired
  // value from cache while the fetch processes in the 
  // background and eventually causes a re-render
  if (name === undefined) return <div>Loading</div>;

  return <Pane className="name">name</Pane>;
}
```
