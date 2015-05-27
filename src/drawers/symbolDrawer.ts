///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Symbol extends Element {

    constructor(dataset: Dataset) {
      super(dataset);
      this._svgElement = "path";
      this._className = "symbol";
    }

  }
}
}
