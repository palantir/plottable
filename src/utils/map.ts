///<reference path="../reference.ts" />

module Plottable {
export module Utils {
  export class Map<K, V> {
    private _keyValuePairs: { key: K; value: V; }[] = [];

    /**
     * Set a new key/value pair in the Map.
     *
     * @param {K} key Key to set in the Map
     * @param {V} value Value to set in the Map
     * @return {boolean} True if key already in Map, false otherwise
     */
    public set(key: K, value: V) {
      if (key !== key) {
        throw new Error("NaN may not be used as a key to the Map");
      }
      for (var i = 0; i < this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i].key === key) {
          this._keyValuePairs[i].value = value;
          return true;
        }
      }
      this._keyValuePairs.push({ key: key, value: value });
      return false;
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
     * Return an array of the values in the Map
     *
     * @return {V[]} The values in the store
     */
    public values() {
      return this._keyValuePairs.map((keyValuePair) => keyValuePair.value);
    }

    /**
     * Return an array of keys in the Map.
     *
     * @return {K[]} The keys in the store
     */
    public keys() {
      return this._keyValuePairs.map((keyValuePair) => keyValuePair.key);
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
