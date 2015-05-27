///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Rect extends Element {

    constructor(dataset: Dataset) {
      super(dataset);
      this.svgElement("rect");
    }

    public draw(data: any[], drawSteps: DrawStep[]) {
      var attrToProjector = drawSteps[0].attrToProjector;
      var isValidNumber = Plottable.Utils.Methods.isValidNumber;
      data = data.filter((e: any, i: number) => {
        return isValidNumber(attrToProjector["x"](e, null, this._dataset)) &&
               isValidNumber(attrToProjector["y"](e, null, this._dataset)) &&
               isValidNumber(attrToProjector["width"](e, null, this._dataset)) &&
               isValidNumber(attrToProjector["height"](e, null, this._dataset));
      });
      return super.draw(data, drawSteps);
    }
  }
}
}
