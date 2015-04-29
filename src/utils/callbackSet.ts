///<reference path="../reference.ts" />

module Plottable {
  export module Utils {
    /**
     * A set of callbacks which can be all invoked at once.
     * Each callback exists at most once in the set (based on reference equality).
     * All callbacks should have the same signature.
     */
    export class CallbackSet<CB extends Function> {
      private _values: CB[];

      constructor() {
        this._values = [];
      }

      public add(value: CB) {
        if (this._values.indexOf(value) === -1) {
          this._values.push(value);
        }
        return this;
      }

      public remove(value: CB) {
        var index = this._values.indexOf(value);
        if (index !== -1) {
          this._values.splice(index, 1);
        }
        return this;
      }

      public values() {
        return this._values;
      }

      public callCallbacks(...args: any[]) {
        this.values().forEach((callback) => {
          callback.apply(this, args);
        });
        return this;
      }
    }
  }
}
