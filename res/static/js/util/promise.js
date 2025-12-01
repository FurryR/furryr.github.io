export function withResolvers() {
  let resolveFn, rejectFn
  return {
    promise: new Promise((resolve, reject) => {
      ;[resolveFn, rejectFn] = [resolve, reject]
    }),
    resolve: resolveFn,
    reject: rejectFn
  }
}
