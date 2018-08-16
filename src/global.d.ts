interface IFromCache<T> {
  data: T
  hasExpired: boolean
}

interface ICached {
  data: any
  expiration?: number
}
