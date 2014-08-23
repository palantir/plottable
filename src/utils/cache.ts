///<reference path="../reference.ts" />

module Plottable {
export module Util {
  export class Cache<T> {
    private cache: D3.Map<T> = d3.map();
    private compute: (k: string) => T;
    private canonicalKey: string = null;
    private valueEq: (v: T, w: T) => boolean;

    /**
     * @constructor
     *
     * @param {string} compute The function whose results will be cached.
     * @param {string} [canonicalKey] If present, when clear() is called,
     *        this key will be re-computed. If its result hasn't been changed,
     *        the cache will not be cleared.
     * @param {(v: T, w: T) => boolean} [valueEq]
     *        Used to determine if the value of canonicalKey has changed.
     *        If omitted, defaults to === comparision.
     */
    constructor(compute: (k: string) => T,
                canonicalKey?: string,
                valueEq: (v: T, w: T) => boolean =
                         (v: T, w: T) => v === w) {
      this.compute = compute;
      this.canonicalKey = canonicalKey;
      this.valueEq = valueEq;
      if (canonicalKey !== undefined) {
        this.cache.set(this.canonicalKey, this.compute(this.canonicalKey));
      }
    }

    /**
     * Attempt to look up k in the cache, computing the result if it isn't
     * found.
     *
     * @param {string} k The key to look up in the cache.
     * @return {T} The value associated with k; the result of compute(k).
     */
    public get(k: string): T {
      if (!this.cache.has(k)) {
        this.cache.set(k, this.compute(k));
      }
      return this.cache.get(k);
    }

    /**
     * Reset the cache empty.
     *
     * If canonicalKey was provided at construction, compute(canonicalKey)
     * will be re-run. If the result matches what is already in the cache,
     * it will not clear the cache.
     *
     * @return {Cache<T>} The calling Cache.
     */
    public clear(): Cache<T> {
      if (this.canonicalKey === undefined ||
          !this.valueEq(this.cache.get(this.canonicalKey),
                        this.compute(this.canonicalKey))) {
        this.cache = d3.map();
      }
      return this;
    }
  }
}
}
