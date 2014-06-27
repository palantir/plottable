///<reference path="../reference.ts" />

module Plottable {
export module Util {
  export class Cache<Value> {
    private cache: D3.Map = d3.map();
    private compute: (k: string) => Value;
    private canonicalKey: string = null;
    private valueEq: (v: Value, w: Value) => boolean;

    /**
     * @constructor
     *
     * @param {string} compute The function whose results will be cached.
     * @param {string} [canonicalKey] If present, when clear() is called,
     *        this key will be re-computed. If its result hasn't been changed,
     *        the cache will not be cleared. If canonicalKey is given, valueEq
     *        must be given as well.
     * @param {(v: Value, w: Value) => boolean} [valueEq]
     *        Used to determine if the value of canonicalKey has changed.
     */
    constructor(compute: (k: string) => Value,
                canonicalKey?: string,
                valueEq?: (v: Value, w: Value) => boolean) {
      this.compute = compute;
      if (canonicalKey != null && valueEq != null) {
        this.canonicalKey = canonicalKey;
        this.valueEq = valueEq;
        this.cache.set(this.canonicalKey, this.compute(this.canonicalKey));
      }
    }

    /**
     * Attempt to look up k in the cache, computing the result if it isn't
     * found.
     */
    public get(k: string): Value {
      if (!this.cache.has(k)) {
        this.cache.set(k, this.compute(k));
      }
      return this.cache.get(k);
    }

    /**
     * Reset the cache empty. However, if the canonicalKey passed into the
     * constructor has not changed, the cache will not empty. See the
     * constructor for more.
     */
    public clear(): Cache<Value> {
      if (this.canonicalKey == null ||
          !this.valueEq(this.cache.get(this.canonicalKey),
                        this.compute(this.canonicalKey))) {
        this.cache = d3.map();
      }
      return this;
    }
  }
}
}
