///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Arc extends Drawer {
    private _isOutline: boolean;

    constructor(dataset: Dataset, isOutline = false) {
      super(dataset);
      this._className = "arc " + (isOutline ? "outline" : "fill");
      this._svgElementName = "path";
      this._isOutline = isOutline;
    }

    protected _applyDefaultAttributes(selection: d3.Selection<any>) {
      super._applyDefaultAttributes(selection);
      selection.style(this._isOutline ? "fill" : "stroke", "none");
    }
  }
}
}
