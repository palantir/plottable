///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Line extends Drawer {
    public static PATH_CLASS = "line";

    constructor(dataset: Dataset) {
      super(dataset);
      this._className = "line";
    }

    protected _setDefaultAttributes(selection: d3.Selection<any>) {
      super._setDefaultAttributes(selection);
      selection.classed(Line.PATH_CLASS, true)
                         .style("fill", "none");
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
