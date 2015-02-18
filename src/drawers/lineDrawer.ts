///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Line extends AbstractDrawer {
    public static LINE_CLASS = "line";

    private _pathSelection: D3.Selection;
    private _xProjector: _AppliedProjector;
    private _yProjector: _AppliedProjector;

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

    private _createLine(xFunction: _AppliedProjector, yFunction: _AppliedProjector, definedFunction: _AppliedProjector) {
      if(!definedFunction) {
        definedFunction = (d, i) => true;
      }

      return d3.svg.line()
                   .x(xFunction)
                   .y(yFunction)
                   .defined(definedFunction);
    }

    protected _numberOfAnimationIterations(data: any[]): number {
      return 1;
    }

    protected _drawStep(step: AppliedDrawStep) {
      var baseTime = super._drawStep(step);
      var attrToProjector = <_AttributeToAppliedProjector>_Util.Methods.copyMap(step.attrToProjector);
      this._xProjector    = attrToProjector["x"];
      this._yProjector    = attrToProjector["y"];
      var definedFunction = attrToProjector["defined"];

      delete attrToProjector["x"];
      delete attrToProjector["y"];
      if (attrToProjector["defined"]) {
        delete attrToProjector["defined"];
      }

      attrToProjector["d"] = this._createLine(this._xProjector, this._yProjector, definedFunction);
      if (attrToProjector["fill"]) {
        this._pathSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }

      step.animator.animate(this._pathSelection, attrToProjector);

      // Restore classes that may have been overridden by class projectors
      this._pathSelection.classed(Line.LINE_CLASS, true);
    }

    public _getSelector() {
      return "." + Line.LINE_CLASS;
    }

    public _getPixelPoint(selection: D3.Selection, datum: any, index: number) {
      return { x: this._xProjector(datum, index), y: this._yProjector(datum, index) };
    }
  }
}
}
