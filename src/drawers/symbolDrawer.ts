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
      this._attrToProjector = <AttributeToAppliedProjector>Utils.Methods.copyMap(step.attrToProjector);
      super._drawStep(step);
    }

    public _getPixelPoint(datum: any, index: number): Point {
      return { x: this._attrToProjector["x"](datum, index), y: this._attrToProjector["y"](datum, index) };
    }
  }
}
}
