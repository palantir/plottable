///<reference path="../reference.ts" />

module Plottable {
export module Utils {
  /**
   * Shim for the ES6 map (although NaN is not allowed as a key).
   */
  export class Map<K, V> {
    private _keyValuePairs: { key: K; value: V; }[] = [];
    
    /**
     * Set a new key/value pair in the store.
     *
     * @return {boolean} True if key already in store, false otherwise
     */
    public set(key: K, value: V) {
      if (key !== key) {
        throw new Error("NaN may not be used as a key to Map");
      }
      for (var i = 0; i < this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i].key === key) {
          this._keyValuePairs[i].value = value;
          return true;
        }
      }
      this._keyValuePairs.push({
        key: key,
        value: value
      });
      return false;
    }

    /**
     * Get a value from the store, given a key.
     *
     * @return {V} value if found, undefined otherwise
     */
    public get(key: K): V {
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
     */
    public has(key: K): boolean {
      for (var i = 0; i < this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i].key === key) {
          return true;
        }
      }
      return false;
    }

    public values(): V[] {
      return this._keyValuePairs.map((pair) => pair.value);
    }
    
    public keys(): K[] {
      return this._keyValuePairs.map((pair) => pair.key);
    }

    /**
     * Delete a key from the key-value store.
     *
     * @return {boolean} Whether a matching entry was found and removed
     */
    public delete(key: K): boolean {
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
