import * as React from "react";
import { useCache } from "../src/storage-utils";
import { cacheKey } from "./testUtils";

interface ITestComponentProps {
  ttl: number;
  doFetch: () => Promise<string>;
  useExpired?: boolean;
}

export const loadingText = "Loading...";

export function TestComponent({ ttl, doFetch, useExpired }: ITestComponentProps) {
  let cached = useCache(localStorage, cacheKey, doFetch, ttl, useExpired);

  if (cached === undefined) {
  return <div>{loadingText}</div>;
  }

  // console.log(`test-component rendering: ${cached}`);
return <div>{cached}</div>;
}
