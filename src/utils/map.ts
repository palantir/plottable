///<reference path="../reference.ts" />

module Plottable {
export module Utils {
  /**
   * Shim for ES6 map.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
   */
  export class Map<K, V> {
    private _keyValuePairs: { key: K; value: V; }[] = [];

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

    public get(key: K) {
      for (var i = 0; i < this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i].key === key) {
          return this._keyValuePairs[i].value;
        }
      }
      return undefined;
    }

    public has(key: K) {
      for (var i = 0; i < this._keyValuePairs.length; i++) {
        if (this._keyValuePairs[i].key === key) {
          return true;
        }
      }
      return false;
    }

    public forEach(callbackFn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {
      this._keyValuePairs.forEach((keyValuePair) => {
        callbackFn.call(thisArg, keyValuePair.value, keyValuePair.key, this);
      });
    }

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
