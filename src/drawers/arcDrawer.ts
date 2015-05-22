///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Arc extends Element {

    constructor(key: string) {
      super(key);
      this._svgElement = "path";
    }
  }
}
}
