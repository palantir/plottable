///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Symbol extends Element {

    constructor(key: string) {
      super(key);
      this._svgElement = "path";
      this._className = "symbol";
    }

  }
}
}
