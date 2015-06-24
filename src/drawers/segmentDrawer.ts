///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Segment extends Drawer {

    constructor(dataset: Dataset) {
      super(dataset);
      this._svgElementName = "line";
    }

    protected _applyDefaultAttributes(selection: d3.Selection<any>) {
      super._applyDefaultAttributes(selection);
    }

  }
}
}
