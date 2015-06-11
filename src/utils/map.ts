///<reference path="../reference.ts" />

module Plottable {
export module Utils {
  /**
   * Shim for ES6 map.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
   */
  export class Map<K, V> {
    private _keyValuePairs: { key: K; value: V; }[] = [];

    /**
     * Set a new key/value pair in the Map.
     *
     * @param {K} key Key to set in the Map
     * @param {V} value Value to set in the Map
     * @return {Map} The Map object
     */
    public set(key: K, value: V) {
      if (Utils.Math.isNaN(key)) {
        throw new Error("NaN may not be used as a key to the Map");
      }
      for (var i = 0; i < this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i].key === key) {
          this._keyValuePairs[i].value = value;
          return this;
        }
      }
      this._keyValuePairs.push({ key: key, value: value });
      return this;
    }

    /**
     * Get a value from the store, given a key.
     *
     * @param {K} key Key associated with value to retrieve
     * @return {V} Value if found, undefined otherwise
     */
    public get(key: K) {
      for (var i = 0; i < this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i].key === key) {
          return this._keyValuePairs[i].value;
        }
      }
      return undefined;
    }

    /**
     * Test whether store has a value associated with given key.
     *
     * Will return true if there is a key/value entry,
     * even if the value is explicitly `undefined`.
     *
     * @param {K} key Key to test for presence of an entry
     * @return {boolean} Whether there was a matching entry for that key
     */
    public has(key: K) {
      for (var i = 0; i < this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i].key === key) {
          return true;
        }
      }
      return false;
    }

    /**
     * The forEach method executes the provided callback once for each key of the map which
     * actually exist. It is not invoked for keys which have been deleted.
     *
     * @param {(value: V, key: K, map: Map<K, V>) => void} callbackFn The callback to be invoked
     * @param {any} thisArg The `this` context
     */
    public forEach(callbackFn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {
      this._keyValuePairs.forEach((keyValuePair) => {
        callbackFn.call(thisArg, keyValuePair.value, keyValuePair.key, this);
      });
    }

    /**
     * Delete a key from the Map. Return whether the key was present.
     *
     * @param {K} The key to remove
     * @return {boolean} Whether a matching entry was found and removed
     */
    public delete(key: K) {
      for (var i = 0; i < this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i].key === key) {
          this._keyValuePairs.splice(i, 1);
          return true;
        }
      }
      return false;
    }
  }
}
}
