import "core-js/features/promise";
import { getHighlyAvailable } from "../src/storage-utils";
import { cacheKey, fromCacheExpected, getLastSet, mockCached } from "./testUtils";

const fromFetchExpected = "from-fetch-expected";
let fetchCalls = 0;
const doFetch = () => {
  fetchCalls++;
  return Promise.resolve(fromFetchExpected);
};

let resolved: string[] = [];
const resolve = (data: string) => {
  resolved.push(data);
};

// TODO these are annoying for local development, turn them off unless before a push
describe("getHighlyAvailable function", () => {
  beforeEach(() => {
    fetchCalls = 0;
    resolved = [];
    localStorage.clear();
    (localStorage.setItem as any).mockClear();
    (localStorage.getItem as any).mockClear();
  });

  it("should retrieve only from the cache if it's present and not expired", (done) => {
    mockCached(100);
    const ttl = 5000;
    const readFromCache = getHighlyAvailable(localStorage, cacheKey, doFetch, ttl, resolve);
    setTimeout(() => {
      // wait for 100 milliseconds cause we don't signal when we are done back
      // to the caller, but these are just tests
      expect(resolved.length).toEqual(0);
      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem).toHaveBeenCalledWith(cacheKey);
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(fetchCalls).toEqual(0);
      done();
    }, 1000);
    expect(readFromCache).toEqual(fromCacheExpected);
  });

  it("should resolve from cache then fetch and update cache", (done) => {
    mockCached(-1);
    const ttl = 5000;
    const readFromCache = getHighlyAvailable(localStorage, cacheKey, doFetch, ttl, resolve);
    const expectedExpiration = new Date().getTime() + ttl;
    setTimeout(() => {
      expect(resolved[0]).toEqual(fromFetchExpected);
      expect(resolved.length).toEqual(1);
      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey);
      const set = getLastSet();
      expect(set.key).toEqual(cacheKey);
      expect(set.data).toEqual(fromFetchExpected);
      // expiration set to within a second of what we expect
      expect(expectedExpiration / 2000 - set.expiration / 2000).toBeCloseTo(0, 0);
      expect(fetchCalls).toEqual(1);
      done();
    }, 1000);
    expect(readFromCache).toEqual(fromCacheExpected);
  });

  it("should resolve only from fetch if it's not in cache", (done) => {
    const ttl = 5000;
    const readFromCache = getHighlyAvailable(localStorage, cacheKey, doFetch, ttl, resolve);
    const expectedExpiration = new Date().getTime() + ttl;
    setTimeout(() => {
      expect(resolved[0]).toEqual(fromFetchExpected);
      expect(resolved.length).toEqual(1);
      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey);
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      const set = getLastSet();
      expect(set.key).toEqual(cacheKey);
      expect(set.data).toEqual(fromFetchExpected);
      // expiration set to within a second of what we expect
      expect(expectedExpiration / 2000 - set.expiration / 2000).toBeCloseTo(0, 0);
      expect(fetchCalls).toEqual(1);
      done();
    }, 1000);
    expect(readFromCache).toBe(undefined);
  });

  it("should sucessfully cache", (done) => {
    const ttl = 10000;
    const readFromCache = getHighlyAvailable(localStorage, cacheKey, doFetch, ttl, resolve);
    setTimeout(() => {
      expect(resolved[0]).toEqual(fromFetchExpected);
      expect(resolved.length).toEqual(1);
      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey);
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      const set = getLastSet();
      expect(set.key).toEqual(cacheKey);
      expect(set.data).toEqual(fromFetchExpected);
      // expiration set to within a tenth of a second of what we expect
      expect(fetchCalls).toEqual(1);

      // reset the resolved to make testing below simpler
      resolved = [];
      const againFromCache = getHighlyAvailable(localStorage, cacheKey, doFetch, ttl, resolve);
      setTimeout(() => {
        expect(resolved.length).toEqual(0);
        expect(localStorage.getItem).toHaveBeenCalledTimes(2);
        expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey);
        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(fetchCalls).toEqual(1);
        done();
      }, 1000);
      expect(againFromCache).toEqual(fromFetchExpected); // from the first fetch :)
    }, 1000);
    expect(readFromCache).toBe(undefined);
  });
});
