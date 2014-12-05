///<reference path="../reference.ts" />

module Plottable {
export module _Util {
  export class Cache<T> {
    private _cache: D3.Map<T> = d3.map();
    private _compute: (k: string) => T;
    private _canonicalKey: string = null;
    private _valueEq: (v: T, w: T) => boolean;

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
      this._compute = compute;
      this._canonicalKey = canonicalKey;
      this._valueEq = valueEq;
      if (canonicalKey !== undefined) {
        this._cache.set(this._canonicalKey, this._compute(this._canonicalKey));
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
      if (!this._cache.has(k)) {
        this._cache.set(k, this._compute(k));
      }
      return this._cache.get(k);
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
      if (this._canonicalKey === undefined ||
          !this._valueEq(this._cache.get(this._canonicalKey),
                        this._compute(this._canonicalKey))) {
        this._cache = d3.map();
      }
      return this;
    }
  }
}
}
