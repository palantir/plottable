///<reference path="../reference.ts" />

module Plottable {
export module _Util {
  export class IDCounter {
    private _counter: {[id: string]: number} = {};

    private _setDefault(id: any) {
      if (this._counter[id] == null) {
        this._counter[id] = 0;
      }
    }

    public increment(id: any): number {
      this._setDefault(id);
      return ++this._counter[id];
    }

    public decrement(id: any): number {
      this._setDefault(id);
      return --this._counter[id];
    }

    public get(id: any): number {
      this._setDefault(id);
      return this._counter[id];
    }
  }
}
}
