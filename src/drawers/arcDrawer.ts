///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Arc extends Element {

    constructor(dataset: Dataset) {
      super(dataset);
      this._className = "arc";
      this._svgElement = "path";
    }

  }
}
}
