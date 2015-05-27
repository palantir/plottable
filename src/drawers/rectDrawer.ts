///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Rect extends Element {
    private _textArea: D3.Selection;

    constructor(dataset: Dataset) {
      super(dataset);
      this.svgElement("rect");
    }

    public setup(area: D3.Selection) {
      // need to put the bars in a seperate container so we can ensure that they don't cover labels
      super.setup(area.append("g").classed("bar-area", true));
      this._textArea = area.append("g").classed("bar-label-text-area", true);
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
