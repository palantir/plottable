///<reference path="../reference.ts" />

module Plottable {
  export module Utils {
    /**
     * Shim for ES6 set.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
     */
    export class Set<T> {
      private _values: T[];

      constructor() {
        this._values = [];
      }

      public add(value: T) {
        if (!this.has(value)) {
          this._values.push(value);
        }
        return this;
      }

      public delete(value: T) {
        var index = this._values.indexOf(value);
        if (index !== -1) {
          this._values.splice(index, 1);
          return true;
        }
        return false;
      }

      public has(value: T) {
        return this._values.indexOf(value) !== -1;
      }

      public values() {
        return this._values;
      }
    }
  }
}
