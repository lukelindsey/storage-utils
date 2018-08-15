import 'core-js/es6/promise'
import { getOrAdd } from '../src/storage-utils'

const cacheKey = 'some-key'
const fromCacheExpected = [1, 2, 3]
const fromFetchExpected = [2, 4, 6]
const notExpected = [3, 6, 9]
let fetchCalls = 0
const doFetch = () => {
  fetchCalls++
  return Promise.resolve(fromFetchExpected)
}

const doAnotherFetch = () => {
  fetchCalls++
  return Promise.resolve(notExpected)
}

describe('getOrAdd function', () => {
  beforeEach(() => {
    fetchCalls = 0
    localStorage.clear()
    ;(localStorage.setItem as any).mockClear()
    ;(localStorage.getItem as any).mockClear()
  })

  it("should retrieve from the cache if it's present and not expired", done => {
    mockCached(100)
    const ttl = 5000
    getOrAdd(localStorage, cacheKey, doFetch, ttl).then(result => {
      expect(result).toEqual(fromCacheExpected)
      expect(localStorage.getItem).toHaveBeenCalledTimes(1)
      expect(localStorage.getItem).toHaveBeenCalledWith(cacheKey)
      expect(localStorage.setItem).not.toHaveBeenCalled()
      expect(fetchCalls).toEqual(0)
      done()
    })
  })

  it('should update cache with fetched even if using expired', done => {
    mockCached(-1)
    const ttl = 5000
    const useExpired = true
    getOrAdd(localStorage, cacheKey, doFetch, ttl, useExpired).then(result => {
      expect(result).toEqual(fromCacheExpected)
      expect(localStorage.getItem).toHaveBeenCalledTimes(1)
      expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey)
      const set = getLastSet()
      expect(set.key).toEqual(cacheKey)
      expect(set.data).toEqual(fromFetchExpected)
      // expiration set to within a second of what we expect
      expect((new Date().getTime() + ttl) / 2000 - set.expiration / 2000).toBeCloseTo(0, 0)
      expect(fetchCalls).toEqual(1)
      done()
    })
  })

  it("should fetch if it's in cache and expired", done => {
    mockCached(-1)
    const ttl = 5000
    getOrAdd(localStorage, cacheKey, doFetch, ttl).then(result => {
      expect(result).toEqual(fromFetchExpected)
      expect(localStorage.getItem).toHaveBeenCalledTimes(1)
      expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey)
      expect(localStorage.setItem).toHaveBeenCalledTimes(1)
      const set = getLastSet()
      expect(set.key).toEqual(cacheKey)
      expect(set.data).toEqual(fromFetchExpected)
      // expiration set to within a second of what we expect
      expect((new Date().getTime() + ttl) / 2000 - set.expiration / 2000).toBeCloseTo(0, 0)
      expect(fetchCalls).toEqual(1)
      done()
    })
  })

  it("should fetch if it's not in cache", done => {
    const ttl = 5000
    getOrAdd(localStorage, cacheKey, doFetch, ttl).then(result => {
      expect(result).toEqual(fromFetchExpected)
      expect(localStorage.getItem).toHaveBeenCalledTimes(1)
      expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey)
      expect(localStorage.setItem).toHaveBeenCalledTimes(1)
      const set = getLastSet()
      expect(set.key).toEqual(cacheKey)
      expect(set.data).toEqual(fromFetchExpected)
      // expiration set to within a second of what we expect
      expect((new Date().getTime() + ttl) / 2000 - set.expiration / 2000).toBeCloseTo(0, 0)
      expect(fetchCalls).toEqual(1)
      done()
    })
  })
  it("should fetch if it's not in cache and useExpired is true", done => {
    const ttl = 5000
    const useExpired = true
    getOrAdd(localStorage, cacheKey, doFetch, ttl, useExpired).then(result => {
      expect(result).toEqual(fromFetchExpected)
      expect(localStorage.getItem).toHaveBeenCalledTimes(1)
      expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey)
      expect(localStorage.setItem).toHaveBeenCalledTimes(1)
      const set = getLastSet()
      expect(set.key).toEqual(cacheKey)
      expect(set.data).toEqual(fromFetchExpected)
      // expiration set to within a tenth of a second of what we expect
      expect((new Date().getTime() + ttl) / 2000 - set.expiration / 2000).toBeCloseTo(0, 0)
      expect(fetchCalls).toEqual(1)
      done()
    })
  })

  it('should cache indefinitely if no ttl is provided', done => {
    getOrAdd(localStorage, cacheKey, doFetch).then(result => {
      expect(result).toEqual(fromFetchExpected)
      expect(localStorage.getItem).toHaveBeenCalledTimes(1)
      expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey)
      expect(localStorage.setItem).toHaveBeenCalledTimes(1)
      const set = getLastSet()
      expect(set.key).toEqual(cacheKey)
      expect(set.data).toEqual(fromFetchExpected)
      // expiration set to within a tenth of a second of what we expect
      expect(set.expiration).toBeFalsy()
      expect(fetchCalls).toEqual(1)

      // get again and make sure we don't fetch
      getOrAdd(localStorage, cacheKey, doAnotherFetch).then(result => {
        expect(result).toEqual(fromFetchExpected) // from the first fetch :)
        expect(localStorage.getItem).toHaveBeenCalledTimes(2)
        expect(localStorage.getItem).toHaveBeenLastCalledWith(cacheKey)
        expect(localStorage.setItem).toHaveBeenCalledTimes(1)
        expect(fetchCalls).toEqual(1)
        done()
      })
    })
  })
})

function mockCached(seconds: number) {
  const toCache = {
    data: fromCacheExpected,
    expiration: new Date().getTime() + seconds * 1000
  }
  const serialCache = JSON.stringify(toCache)
  // don't call set because we want to make assertions
  // on if it was called in the tests.
  localStorage.__STORE__[cacheKey] = serialCache
}

function getLastSet() {
  const calls = (localStorage.setItem as any).mock.calls
  const last = calls[calls.length - 1]
  const key = last[0]
  const { data, expiration } = JSON.parse(last[1])
  return {
    key,
    data,
    expiration
  }
}
