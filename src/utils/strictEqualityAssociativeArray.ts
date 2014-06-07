///<reference path="../reference.ts" />

module Plottable {
export module Util {
  /**
   * An associative array that can be keyed by anything (inc objects).
   * Uses pointer equality checks which is why this works.
   * This power has a price: everything is linear time since it is actually backed by an array...
   */
  export class StrictEqualityAssociativeArray {
    private keyValuePairs: any[][] = [];

    /**
     * Set a new key/value pair in the store.
     *
     * @param {any} Key to set in the store
     * @param {any} Value to set in the store
     * @return {boolean} True if key already in store, false otherwise
     */
    public set(key: any, value: any) {
      for (var i = 0; i < this.keyValuePairs.length; i++) {
        if (this.keyValuePairs[i][0] === key) {
          this.keyValuePairs[i][1] = value;
          return true;
        }
      }
      this.keyValuePairs.push([key, value]);
      return false;
    }

    public get(key: any): any {
      for (var i = 0; i<this.keyValuePairs.length; i++) {
        if (this.keyValuePairs[i][0] === key) {
          return this.keyValuePairs[i][1];
        }
      }
      return undefined;
    }

    public has(key: any): boolean {
      for (var i = 0; i<this.keyValuePairs.length; i++) {
        if (this.keyValuePairs[i][0] === key) {
          return true;
        }
      }
      return false;
    }

    public values(): any[] {
      return this.keyValuePairs.map((x) => x[1]);
    }

    public delete(key: any): boolean {
      for (var i = 0; i < this.keyValuePairs.length; i++) {
        if (this.keyValuePairs[i][0] === key) {
          this.keyValuePairs.splice(i, 1);
          return true;
        }
      }
      return false;
    }
  }
}
}
