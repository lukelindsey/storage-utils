import { useState, useEffect } from "react";
import { getFromStorage, updateStorage } from "./internalHelpers";

/**
 * Hook to easily enable caching to an async call. Implemented in a way such that
 * when reading from cache, there is no 'bad' value initially acted on as that bit
 * of state. This means when reading from the cache, you won't have a double render
 * @param {Storage} storage storage to use. i.e. localStorage, sessionStorage
 * @param {string} key unique string used as cache key to storage
 * @param {() => Promise<T>} getData returns a promise used to fetch the data
 * @param {number} ttl Time until expired in milliseconds
 * @param {boolean} useExpired if true, the data will be set to the expired value from the
 * cache until getData completes
 * @returns State that is populated from cache, fetch or both
 */
export function useCache<T>(
  storage: Storage,
  key: string,
  getData: (t: T | undefined) => Promise<T>,
  ttl: number,
  useExpired: boolean = true
): T | undefined {
  const fromCache = getFromStorage<T>(storage, key);
  let seedState = fromCache?.data;
  if (!useExpired && !fromCache?.hasTtl) {
    seedState = undefined;
  }

  const [data, setData] = useState<T | undefined>(seedState);

  useEffect(() => {
    if (fromCache === undefined || !fromCache.hasTtl) {
      // tslint:disable-next-line:no-floating-promises
      getData(fromCache?.data).then(data => {
        updateStorage(storage, key, data, ttl);
        setData(data);
      });
    }
  }, []);

  return data;
}
