///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Symbol extends Element {

    constructor(key: string) {
      super(key);
      this._svgElement = "path";
      this._className = "symbol";
    }

    protected _drawStep(step: AppliedDrawStep) {
      var attrToProjector = step.attrToProjector;
      this._attrToProjector = <AttributeToAppliedProjector>Utils.Methods.copyMap(step.attrToProjector);

      var xProjector = attrToProjector["x"];
      var yProjector = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];

      var rProjector = attrToProjector["size"];
      delete attrToProjector["size"];

      attrToProjector["transform"] = (datum: any, index: number) =>
        "translate(" + xProjector(datum, index) + "," + yProjector(datum, index) + ")";

      var symbolProjector = attrToProjector["symbol"];
      delete attrToProjector["symbol"];

      attrToProjector["d"] = attrToProjector["d"] || ((datum: any, index: number) =>
        symbolProjector(datum, index)(rProjector(datum, index)));

      super._drawStep(step);
    }

    public _getPixelPoint(datum: any, index: number): Point {
      return { x: this._attrToProjector["x"](datum, index), y: this._attrToProjector["y"](datum, index) };
    }
  }
}
}
