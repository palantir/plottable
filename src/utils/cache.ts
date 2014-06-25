///<reference path="../reference.ts" />

module Plottable {
export module Util {
  export class Cache<Value> {
    private cache: {[k: string]: Value} = {};
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
        this.cache[this.canonicalKey] = this.compute(this.canonicalKey);
      }
    }

    /**
     * Attempt to look up k in the cache, computing the result if it isn't
     * found.
     */
    public get(k: string): Value {
      if (!(k in this.cache)) {
        this.cache[k] = this.compute(k);
      }
      return this.cache[k];
    }

    /**
     * Reset the cache empty. However, if the canonicalKey passed into the
     * constructor has not changed, the cache will not empty. See the
     * constructor for more.
     */
    public clear(): Cache<Value> {
      if (this.canonicalKey == null ||
          !this.valueEq(this.cache[this.canonicalKey],
                        this.compute(this.canonicalKey))) {
        this.cache = {};
      }
      return this;
    }
  }
}
}
