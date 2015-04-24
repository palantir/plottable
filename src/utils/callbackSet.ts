///<reference path="../reference.ts" />

module Plottable {
  export module Utils {
    export class CallbackSet extends Set<Function> {
      public callCallbacks(...args: any[]) {
        // no fat-arrow notation to set "this" to current "this" context
        this.values().forEach(function(callback) { callback.apply(this, args); });
        return this;
      }
    }
  }
}
