///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Area extends Line {
    public static PATH_CLASS = "area";

    constructor(dataset: Dataset) {
      super(dataset);
      this._className = "area";
    }

    protected _setDefaultAttributes(selection: d3.Selection<any>) {
      (<any> Drawer).prototype._setDefaultAttributes(selection);
      selection.classed(Area.PATH_CLASS, true)
               .style("stroke", "none");
    }

    public selector(): string {
      return "path";
    }
  }
}
}
