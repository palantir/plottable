module Plottable {
export module Drawers {
  export class Segment extends Drawer {
    constructor(dataset: Dataset) {
      super(dataset);
      this._svgElementName = "line";
    }
  }
}
}
