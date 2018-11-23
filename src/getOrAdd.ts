import { getFromStorage, updateStorage } from "./internalHelpers";

/**
 * @param {Storage} storage storage to use. i.e. localStorage, sessionStorage
 * @param {string} key
 * @param {() => Promise<T>} getData returns a promise used to fetch the data from if it's not in cache
 * @param {number?} ttl Max time to live in milliseconds
 * @param {boolean?} useExpired If true, will return expired items from cache while updating in the background.
 */
export function getOrAdd<T>(
  storage: Storage,
  key: string,
  getData: (expiredData?: T) => Promise<T>,
  ttl?: number,
  useExpired?: boolean
): Promise<T> {
  const cached = getFromStorage<T>(storage, key);
  // if not expired, we can leave
  if (cached && !cached.hasExpired) return Promise.resolve(cached.data);

  // if expired or missing, start the fetch
  const expired = cached ? cached.data : undefined;
  const fetch = getData(expired).then(data => {
    updateStorage(storage, key, data, ttl);
    return data;
  });

  // already working on the update, leave and return the stale data if requested
  if (cached && useExpired) return Promise.resolve(cached.data);
  return fetch;
}
