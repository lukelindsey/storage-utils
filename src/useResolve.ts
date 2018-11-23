import { getFromStorage, updateStorage } from "./internalHelpers";

/**
 * @param {Storage} storage storage to use. i.e. localStorage, sessionStorage
 * @param {string} key
 * @param {() => Promise<T>} getData returns a promise used to fetch the data
 * @param {number} ttl Max time to live in milliseconds
 * @param {(T) => void} resolve function called with the value from the cache
 * and then from the fetch if expired
 * @returns {Promise} returns a promise that resolves when the final resolve
 * has completed
 */
export function useResolve<T>(
  storage: Storage,
  key: string,
  getData: (expiredData?: T) => Promise<T>,
  ttl: number,
  resolve: (data: T) => any
): Promise<void> {
  const cached = getFromStorage<T>(storage, key);

  // if we have something, go ahead and resolve with it
  if (cached) {
    resolve(cached.data);
    // if not expired, we are done
    if (!cached.hasExpired) return Promise.resolve();
  }

  // if expired or missing, start the fetch
  const expired = cached ? cached.data : undefined;
  return new Promise(finished => {
    getData(expired).then(data => {
      updateStorage(storage, key, data, ttl);
      resolve(data);
      finished(); // should we require using a promise with finally?
    });
  });
}
