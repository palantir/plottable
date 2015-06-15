///<reference path="../reference.ts" />

module Plottable {
export module Utils {
  /**
   * Shim for ES6 set.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
   */
  export class Set<T> {
    public size: number;

    private _values: T[];

    constructor() {
      this._values = [];
      this._updateSize();
    }

    public add(value: T) {
      if (!this.has(value)) {
        this._values.push(value);
        this._updateSize();
      }
      return this;
    }

    public delete(value: T) {
      var index = this._values.indexOf(value);
      if (index !== -1) {
        this._values.splice(index, 1);
        this._updateSize();
        return true;
      }
      return false;
    }

    public has(value: T) {
      return this._values.indexOf(value) !== -1;
    }

    public forEach(callback: (value: T, value2: T, set: Set<T>) => void, thisArg?: any) {
      this._values.forEach((value: T) => {
        callback.call(thisArg, value, value, this);
      });
    }

    /**
     * Updates the value of the read-only parameter size
     */
    private _updateSize() {
      Object.defineProperty(this, "size", {
        value: this._values.length,
        configurable: true
      });
    }
  }
}
}
