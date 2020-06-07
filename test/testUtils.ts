export const cacheKey = "some-key";

export const fromCacheExpected = [1, 2, 3];

export function mockCached(seconds: number) {
  const toCache = {
    data: fromCacheExpected,
    expiration: new Date().getTime() + seconds * 1000,
  };
  const serialCache = JSON.stringify(toCache);
  // don't call set because we want to make assertions
  // on if it was called in the tests.
  localStorage.__STORE__[cacheKey] = serialCache;
}

export function getLastSet() {
  const calls = (localStorage.setItem as any).mock.calls;
  const last = calls[calls.length - 1];
  const key = last[0];
  const { data, expiration } = JSON.parse(last[1]);
  return {
    key,
    data,
    expiration,
  };
}
