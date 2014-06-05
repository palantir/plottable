///<reference path="../reference.ts" />

module Plottable {
export module Utils {
  export class IDCounter {
    private counter: {[id: string]: number} = {};

    private setDefault(id: any) {
      if (this.counter[id] == null) {
        this.counter[id] = 0;
      }
    }

    public increment(id: any): number {
      this.setDefault(id);
      return ++this.counter[id];
    }

    public decrement(id: any): number {
      this.setDefault(id);
      return --this.counter[id];
    }

    public get(id: any): number {
      this.setDefault(id);
      return this.counter[id];
    }
  }
}
}
