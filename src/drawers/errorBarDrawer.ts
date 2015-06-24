///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class ErrorBar extends Drawer {

    private _ERROR_BAR_CLASS = "error-bar";

    constructor(dataset: Dataset) {
      super(dataset);
      this._className = this._ERROR_BAR_CLASS;
      this._svgElementName = "line";
    }
  }
}
}
