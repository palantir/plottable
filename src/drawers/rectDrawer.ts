///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Rect extends Element {

    constructor(dataset: Dataset) {
      super(dataset);
      this.svgElement("rect");
    }

  }
}
}
