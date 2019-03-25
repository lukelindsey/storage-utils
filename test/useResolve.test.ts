import "core-js/features/promise";
import { useResolve } from "../src/storage-utils";
import { cacheKey, fromCacheExpected, getLastSet, mockCached } from "./testUtils";

const fromFetchExpected = [2, 4, 6];
const notExpected = [3, 6, 9];
let fetchCalls = 0;
const doFetch = () => {
  fetchCalls++;
  return Promise.resolve(fromFetchExpected);
};

const doAnotherFetch = () => {
  fetchCalls++;
  return Promise.resolve(notExpected);
};

let resolved: number[][] = [];
const resolve = (data: number[]) => {
  resolved.push(data);
};

describe("useResolve function", () => {
  beforeEach(() => {
    fetchCalls = 0;
    resolved = [];
    localStorage.clear();
    (localStorage.setItem as any).mockClear();
    (localStorage.getItem as any).mockClear();
  });

  it("should retrieve only from the cache if it's present and not expired", done => {
    mockCached(100);
    const ttl = 5000;
    useResolve(localStorage, cacheKey, doFetch, ttl, resolve).then(() => {
      expect(resolved[0]).toEqual(fromCacheExpected);
      expect(resolved.length).toEqual(1);
      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem).toHaveBeenCalledWith(cacheKey);
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(fetchCalls).toEqual(0);
      done();
    });
  });

  it("should resolve from cache then fetch and update cache", done => {
    mockCached(-1);
    const ttl = 5000;
    useResolve(localStorage, cacheKey, doFetch, ttl, resolve).then(() => {
      expect(resolved[0]).toEqual(fromCacheExpected);
      expect(resolved[1]).toEqual(fromFetchExpected);
      expect(resolved.length).toEqual(2);
      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey);
      const set = getLastSet();
      expect(set.key).toEqual(cacheKey);
      expect(set.data).toEqual(fromFetchExpected);
      // expiration set to within a second of what we expect
      expect((new Date().getTime() + ttl) / 2000 - set.expiration / 2000).toBeCloseTo(0, 0);
      expect(fetchCalls).toEqual(1);
      done();
    });
  });

  it("should resolve only from fetch if it's not in cache", done => {
    const ttl = 5000;
    useResolve(localStorage, cacheKey, doFetch, ttl, resolve).then(() => {
      expect(resolved[0]).toEqual(fromFetchExpected);
      expect(resolved.length).toEqual(1);
      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey);
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      const set = getLastSet();
      expect(set.key).toEqual(cacheKey);
      expect(set.data).toEqual(fromFetchExpected);
      // expiration set to within a second of what we expect
      expect((new Date().getTime() + ttl) / 2000 - set.expiration / 2000).toBeCloseTo(0, 0);
      expect(fetchCalls).toEqual(1);
      done();
    });
  });

  it("should sucessfully cache", done => {
    const ttl = 10000;
    useResolve(localStorage, cacheKey, doFetch, ttl, resolve).then(() => {
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

      // get again and make sure we don't fetch
      useResolve(localStorage, cacheKey, doAnotherFetch, ttl, resolve).then(() => {
        expect(resolved[0]).toEqual(fromFetchExpected); // from the first fetch :)
        expect(resolved.length).toEqual(1);
        expect(localStorage.getItem).toHaveBeenCalledTimes(2);
        expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey);
        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(fetchCalls).toEqual(1);
        done();
      });
    });
  });
});
