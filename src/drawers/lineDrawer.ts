///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Line extends AbstractDrawer {
    public static LINE_CLASS = "line";
    protected _interpolate: string | ((points: number[][]) => string);
    private _pathSelection: D3.Selection;

    protected _enterData(data: any[]) {
      super._enterData(data);
      this._pathSelection.datum(data);
    }

    public setup(area: D3.Selection) {
      this._pathSelection = area.append("path")
                               .classed(Line.LINE_CLASS, true)
                               .style({
                                 "fill": "none",
                                 "vector-effect": "non-scaling-stroke"
                               });
      super.setup(area);
    }

    public interpolationMode(interpolationMode: string | ((points: number[][]) => string)) {
      this._interpolate = interpolationMode;
    }

    private _createLine(xFunction: AppliedProjector, yFunction: AppliedProjector, definedFunction: AppliedProjector) {
      if(!definedFunction) {
        definedFunction = (d, i) => true;
      }

      return d3.svg.line()
                   .x(xFunction)
                   .y(yFunction)
                   .defined(definedFunction)
                   .interpolate(this._interpolate);
    }

    protected _numberOfAnimationIterations(data: any[]): number {
      return 1;
    }

    protected _drawStep(step: AppliedDrawStep) {
      var baseTime = super._drawStep(step);
      var attrToProjector = <AttributeToAppliedProjector>_Util.Methods.copyMap(step.attrToProjector);
      var definedFunction = attrToProjector["defined"];

      var xProjector = attrToProjector["x"];
      var yProjector = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];
      if (attrToProjector["defined"]) {
        delete attrToProjector["defined"];
      }

      attrToProjector["d"] = this._createLine(xProjector, yProjector, definedFunction);
      if (attrToProjector["fill"]) {
        this._pathSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }

      if (attrToProjector["class"]) {
        this._pathSelection.attr("class", attrToProjector["class"]);
        this._pathSelection.classed(Line.LINE_CLASS, true);
        delete attrToProjector["class"];
      }

      step.animator.animate(this._pathSelection, attrToProjector);
    }

    public _getSelector() {
      return "." + Line.LINE_CLASS;
    }

    public _getPixelPoint(datum: any, index: number): Point {
      return { x: this._attrToProjector["x"](datum, index), y: this._attrToProjector["y"](datum, index) };
    }

    public _getSelection(index: number): D3.Selection {
      return this._getRenderArea().select(this._getSelector());
    }
  }
}
}
