///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Area extends Drawer {
    public static PATH_CLASS = "area";

    constructor(dataset: Dataset) {
      super(dataset);
      this._className = "area";
    }

    protected _setDefaultAttributes(selection: d3.Selection<any>) {
      super._setDefaultAttributes(selection);
      selection.classed(Area.PATH_CLASS, true)
               .style("stroke", "none");
    }

    public selector(): string {
      return "path";
    }

    public selectionForIndex(index: number) {
      return this.renderArea().select(this.selector());
    }
  }
}
}
