module Plottable {
export module Drawers {
  export class Line extends Drawer {

    constructor(dataset: Dataset) {
      super(dataset);
      this._className = "line";
      this._svgElementName = "path";
    }

    protected _applyDefaultAttributes(selection: d3.Selection<any>) {
      super._applyDefaultAttributes(selection);
      selection.style("fill", "none");
    }

    public selectionForIndex(index: number): d3.Selection<any> {
      return d3.select(this.selection()[0][0]);
    }
  }
}
}
