///<reference path="../reference.ts" />

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

      public selectionForIndex(index: number) {
        return this.renderArea().select(this.selector());
      }
    }
  }
}
