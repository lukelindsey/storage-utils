import { getFromStorage, updateStorage } from "./internalHelpers";

/**
 * @param {Storage} storage storage to use. i.e. localStorage, sessionStorage
 * @param {string} key unique string used as cache key to storage
 * @param {() => Promise<T>} getData returns a promise used to fetch the data
 * @param {number} ttl Max time to live in milliseconds
 * @param {(T) => void} resolve function called with the value from the fetch if expired
 * @returns The data from the cache, whether it's expired or not. undefined if
 * it wasn't in the cache at all
 */
export function getHighlyAvailable<T>(
  storage: Storage,
  key: string,
  getData: (expiredData?: T) => Promise<T>,
  ttl: number,
  resolve: (data: T) => any
): T | undefined {
  const cached = getFromStorage<T>(storage, key);

  // if we have something, go ahead and resolve with it
  if (cached) {
    // if not expired, we are done
    if (cached.hasTtl) return cached.data;
  }

  // if expired or missing, start the fetch
  const expired = cached ? cached.data : undefined;
  getData(expired).then(data => {
    updateStorage(storage, key, data, ttl);
    resolve(data);
    return;
  });
  return expired;
}
