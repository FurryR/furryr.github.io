export type Resolver<T> = {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}

export function withResolvers<T = void>(): Resolver<T> {
  let resolveFn!: Resolver<T>['resolve']
  let rejectFn!: Resolver<T>['reject']
  return {
    promise: new Promise((resolve, reject) => {
      ;[resolveFn, rejectFn] = [resolve, reject]
    }),
    resolve: resolveFn,
    reject: rejectFn
  }
}
