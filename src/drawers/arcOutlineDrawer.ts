module Plottable.Drawers {

  export class ArcOutline extends Drawer {

    constructor(dataset: Dataset) {
      super(dataset);
      this._className = "arc outline";
      this._svgElementName = "path";
    }

    protected _applyDefaultAttributes(selection: d3.Selection<any>) {
      super._applyDefaultAttributes(selection);
      selection.style("fill", "none");
    }
  }
}
