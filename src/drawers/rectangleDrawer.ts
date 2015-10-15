module Plottable {
export module Drawers {
  export class Rectangle extends Drawer {

    constructor(dataset: Dataset) {
      super(dataset);
      this._svgElementName = "rect";
    }

  }
}
}
