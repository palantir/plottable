///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Line extends Drawer {

    constructor(dataset: Dataset) {
      super(dataset);
      this._className = "line";
      this._svgElementName = "path";
    }

    protected _setDefaultAttributes(selection: d3.Selection<any>) {
      super._setDefaultAttributes(selection);
      selection.style("fill", "none");
    }

    public selector() {
      return "path";
    }

    public selectionForIndex(index: number) {
      return this.renderArea().select(this.selector());
    }
  }
}
}
