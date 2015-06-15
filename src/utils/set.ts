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
    private _es6Set: any;

    constructor() {
      if (typeof (<any>window).Set === "function") {
        this._es6Set = new (<any>window).Set();
      } else {
        this._values = [];
      }
      this._updateSize();
    }

    public add(value: T) {
      if (this._es6Set != null) {
        this._es6Set.add(value);
      } else {
        if (!this.has(value)) {
          this._values.push(value);
        }
      }

      this._updateSize();
      return this;
    }

    public delete(value: T): boolean {
      if (this._es6Set != null) {
        var deleted = this._es6Set.delete(value);
        this._updateSize();
        return deleted;
      }

      var index = this._values.indexOf(value);
      if (index !== -1) {
        this._values.splice(index, 1);
        this._updateSize();
        return true;
      }
      return false;
    }

    public has(value: T): boolean {
      if (this._es6Set != null) {
        return this._es6Set.has(value);
      }

      return this._values.indexOf(value) !== -1;
    }

    public forEach(callback: (value: T, value2: T, set: Set<T>) => void, thisArg?: any) {
      if (this._es6Set != null) {
        this._es6Set.forEach(callback, thisArg);
        return;
      }

      this._values.forEach((value: T) => {
        callback.call(thisArg, value, value, this);
      });
    }

    /**
     * Updates the value of the read-only parameter size
     */
    private _updateSize() {
      var newSize = 0;
      if (this._es6Set != null) {
        newSize = this._es6Set.size;
      } else {
        newSize = this._values.length;
      }
      Object.defineProperty(this, "size", {
        value: newSize,
        configurable: true
      });
    }
  }
}
}
