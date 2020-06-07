/** @hidden */
export function getFromStorage<T>(storage: Storage, storageKey: string): IFromCache<T> | undefined {
  const cached = storage.getItem(storageKey);
  if (cached) {
    const parsed: ICached = JSON.parse(cached);
    return {
      hasTtl: hasTimeToLive(parsed.expiration),
      data: parsed.data,
    };
  }
  return undefined;
}

/** @hidden */
export function updateStorage(storage: Storage, storageKey: string, data: any, ttl?: number): void {
  const cacheObject: ICached = {
    data,
    expiration: ttl === undefined ? undefined : getNowMilliseconds() + ttl,
  };
  storage.setItem(storageKey, JSON.stringify(cacheObject));
}

/** @hidden */
function hasTimeToLive(expiration?: number): boolean {
  if (expiration) {
    const now = getNowMilliseconds();
    return expiration > now;
  }
  return true;
}

/** @hidden */
function getNowMilliseconds(): number {
  return new Date().getTime();
}

/** @hidden */
interface IFromCache<T> {
  data: T;
  hasTtl: boolean;
}

/** @hidden */
interface ICached {
  data: any;
  expiration?: number;
}
