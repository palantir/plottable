///<reference path="../reference.ts" />

module Plottable {
export module _Util {
  /**
   * An associative array that can be keyed by anything (inc objects).
   * Uses pointer equality checks which is why this works.
   * This power has a price: everything is linear time since it is actually backed by an array...
   */
  export class StrictEqualityAssociativeArray {
    private _keyValuePairs: any[][] = [];

    /**
     * Set a new key/value pair in the store.
     *
     * @param {any} key Key to set in the store
     * @param {any} value Value to set in the store
     * @return {boolean} True if key already in store, false otherwise
     */
    public set(key: any, value: any) {
      if (key !== key) {
        throw new Error("NaN may not be used as a key to the StrictEqualityAssociativeArray");
      }
      for (var i = 0; i < this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i][0] === key) {
          this._keyValuePairs[i][1] = value;
          return true;
        }
      }
      this._keyValuePairs.push([key, value]);
      return false;
    }

    /**
     * Get a value from the store, given a key.
     *
     * @param {any} key Key associated with value to retrieve
     * @return {any} Value if found, undefined otherwise
     */
    public get(key: any): any {
      for (var i = 0; i<this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i][0] === key) {
          return this._keyValuePairs[i][1];
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
     * @param {any} key Key to test for presence of an entry
     * @return {boolean} Whether there was a matching entry for that key
     */
    public has(key: any): boolean {
      for (var i = 0; i<this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i][0] === key) {
          return true;
        }
      }
      return false;
    }

    /**
     * Return an array of the values in the key-value store
     *
     * @return {any[]} The values in the store
     */
    public values(): any[] {
      return this._keyValuePairs.map((x) => x[1]);
    }

    /**
     * Return an array of keys in the key-value store
     *
     * @return {any[]} The keys in the store
     */
    public keys(): any[] {
      return this._keyValuePairs.map((x) => x[0]);
    }

    /**
     * Execute a callback for each entry in the array.
     *
     * @param {(key: any, val?: any, index?: number) => any} callback The callback to eecute
     * @return {any[]} The results of mapping the callback over the entries
     */
     public map(cb: (key?: any, val?: any, index?: number) => any) {
      return this._keyValuePairs.map((kv: any[], index: number) => {
        return cb(kv[0], kv[1], index);
      });
     }

    /**
     * Delete a key from the key-value store. Return whether the key was present.
     *
     * @param {any} The key to remove
     * @return {boolean} Whether a matching entry was found and removed
     */
    public delete(key: any): boolean {
      for (var i = 0; i < this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i][0] === key) {
          this._keyValuePairs.splice(i, 1);
          return true;
        }
      }
      return false;
    }
  }
}
}
