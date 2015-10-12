module Plottable {
export module Drawers {
  export class Area extends Drawer {

    constructor(dataset: Dataset) {
      super(dataset);
      this._className = "area";
      this._svgElementName = "path";
    }

    protected _applyDefaultAttributes(selection: d3.Selection<any>) {
      super._applyDefaultAttributes(selection);
      selection.style("stroke", "none");
    }

    public selectionForIndex(index: number): d3.Selection<any> {
      return d3.select(this.selection()[0][0]);
    }
  }
}
}
