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
  }
}
}
