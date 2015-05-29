///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Rectangle extends Element {

    constructor(dataset: Dataset) {
      super(dataset);
      this._svgElement = "rect";
    }

  }
}
}
