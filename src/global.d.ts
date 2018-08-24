interface IFromCache<T> {
  data: T;
  hasExpired: boolean;
}

interface ICached {
  data: any;
  expiration?: number;
}

interface IFetchDataParams<M, N = {}> {
  expired?: M;
  params?: N;
}

interface ICachableItem<T, R = {}> {
  cacheKey: string;
  fetchData: (p: IFetchDataParams<T, R>) => Promise<T>;
  ttl: number;
  storage: Storage;
  useExpired: boolean; // if the data has expired, use it this time, while updating in the background.
}
