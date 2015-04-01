///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Symbol extends Element {

    constructor(key: string) {
      super(key);
      this._svgElement = "path";
      this._className = "symbol";
    }

    protected _drawStep(step: AppliedDrawStep) {
      var attrToProjector = step.attrToProjector;
      this._attrToProjector = <AttributeToAppliedProjector>_Util.Methods.copyMap(step.attrToProjector);

      var xProjector = attrToProjector["x"];
      var yProjector = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];

      var rProjector = attrToProjector["r"];
      delete attrToProjector["r"];

      attrToProjector["transform"] = (datum: any, index: number) =>
        "translate(" + xProjector(datum, index) + "," + yProjector(datum, index) + ") " +
        "scale(" + rProjector(datum, index) / 50 + ")";

      var symbolProjector = attrToProjector["symbol"];
      delete attrToProjector["symbol"];

      attrToProjector["d"] = symbolProjector;

      super._drawStep(step);
    }

    public _getPixelPoint(datum: any, index: number): Point {
      return { x: this._attrToProjector["x"](datum, index), y: this._attrToProjector["y"](datum, index) };
    }
  }
}
}
