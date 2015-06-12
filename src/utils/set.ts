///<reference path="../reference.ts" />

module Plottable {
  export module Utils {
    /**
     * Shim for ES6 set.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
     */
    export class Set<T> {
      /**
       * The size of the set. The value is read-only.
       */
      public size: number;

      private _values: T[];

      constructor() {
        this._values = [];
        this._updateSize();
      }

    /**
     * Adds a new value to the Set, unless the value already exists.
     *
     * @param {T} value Value to be added to the Set
     * @return {Set} The Set object
     */
      public add(value: T) {
        if (!this.has(value)) {
          this._values.push(value);
          this._updateSize();
        }
        return this;
      }

      /**
       * Deletes a value from the Set.
       *
       * @param {T} value Value to be deleted from the set
       * @return {boolean} true if the value existed in the set
       * @return {boolean} false if the value did not exist in the set
       */
      public delete(value: T) {
        var index = this._values.indexOf(value);
        if (index !== -1) {
          this._values.splice(index, 1);
          this._updateSize();
          return true;
        }
        return false;
      }

      /**
       * Tests whether or not the Set cotains a value
       */
      public has(value: T) {
        return this._values.indexOf(value) !== -1;
      }

      /**
       * The forEach method executes the provided callback once for each value which actually exists
       * in the Set object. It is not invoked for values which have been deleted.
       *
       * @param {(value: T, value2: T, set: Set<T>) => void} callback The callback to be invoked
       * @param {any} thisArg The `this` context
       */
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
