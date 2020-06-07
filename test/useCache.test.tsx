import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { TestComponent, loadingText } from "./TestComponent";
import { convertMinutesToMilliseconds } from "../src/storage-utils";
import { fromCacheExpected, mockCached, mockExpired } from "./testUtils";

const fromFetchExpected = "from-fetch-expected";
let fetchCalls = 0;
const doFetch = () => {
  fetchCalls++;
  return Promise.resolve(fromFetchExpected);
};

function expectFromCache() {
  expect(screen.queryByText(fromCacheExpected)).not.toEqual(null);
  expect(screen.queryByText(fromFetchExpected)).toEqual(null);
  expect(screen.queryByText(loadingText)).toEqual(null);
}

function expectLoading() {
  expect(screen.queryByText(loadingText)).not.toEqual(null);
  expect(screen.queryByText(fromFetchExpected)).toEqual(null);
  expect(screen.queryByText(fromCacheExpected)).toEqual(null);
}

describe("useCache hook", () => {
  beforeEach(() => {
    fetchCalls = 0;
    localStorage.clear();
    (localStorage.setItem as any).mockClear();
    (localStorage.getItem as any).mockClear();
  });

  it("should read from cache and immediately write to dom if cached", done => {
    // here we are testing that if we read from cache,
    // we don't have a frame where the data isn't loaded
    mockCached(1000);
    render(
      <TestComponent doFetch={doFetch} ttl={convertMinutesToMilliseconds(5)} useExpired={false} />
    );
    expectFromCache();
    setTimeout(() => {
      expect(screen.queryByText(fromFetchExpected)).toEqual(null);
      expect(fetchCalls).toEqual(0);
      done();
    }, 50);
  });
  it("should read from cache and do fetch if in cache, expired, and useExpired is true", (done) => {
    mockExpired();
    render(
      <TestComponent doFetch={doFetch} ttl={convertMinutesToMilliseconds(5)} useExpired={true} />
    );
    expectFromCache();
    waitFor(() => expect(screen.queryByText(fromFetchExpected)).not.toEqual(null)).then(done);
  });
  it("should be undefined then read from fetch if not in cache", (done) => {
    render(
      <TestComponent doFetch={doFetch} ttl={convertMinutesToMilliseconds(5)} useExpired={false} />
    );
    expectLoading();
    waitFor(() => expect(screen.queryByText(fromFetchExpected)).not.toEqual(null)).then(done);
  });

  it("should be undefined then read from fetch if expired and useExpired is false", (done) => {
    mockExpired();
    render(
      <TestComponent doFetch={doFetch} ttl={convertMinutesToMilliseconds(5)} useExpired={false} />
    );
    expectLoading();
    waitFor(() => expect(screen.queryByText(fromFetchExpected)).not.toEqual(null)).then(done);
  });

  it("should default the useExpired param to true", (done) => {
    mockExpired();
    render(
      <TestComponent doFetch={doFetch} ttl={convertMinutesToMilliseconds(5)} />
    );
    expectFromCache();
    waitFor(() => expect(screen.queryByText(fromFetchExpected)).not.toEqual(null)).then(done);
  });
});
