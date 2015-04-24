///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Area extends Line {
    public static AREA_CLASS = "area";

    private _areaSelection: D3.Selection;
    private _drawLine = true;

    protected _enterData(data: any[]) {
      if (this._drawLine) {
        super._enterData(data);
      } else {
        // HACKHACK Forced to use anycast to access protected var
        (<any> AbstractDrawer).prototype._enterData.call(this, data);
      }
      this._areaSelection.datum(data);
    }

    /**
     * Sets the value determining if line should be drawn.
     *
     * @param{boolean} draw The value determing if line should be drawn.
     */
    public drawLine(draw: boolean): Area {
      this._drawLine = draw;
      return this;
    }

    public setup(area: D3.Selection) {
      this._areaSelection = area.append("path")
                               .classed(Area.AREA_CLASS, true)
                               .style({ "stroke": "none" });
      if (this._drawLine) {
        super.setup(area);
      } else {
        AbstractDrawer.prototype.setup.call(this, area);
      }
    }

    private _createArea(xFunction: AppliedProjector,
                       y0Function: AppliedProjector,
                       y1Function: AppliedProjector,
                       definedFunction: AppliedProjector) {
      if(!definedFunction) {
        definedFunction = () => true;
      }

      return d3.svg.area()
                   .x(xFunction)
                   .y0(y0Function)
                   .y1(y1Function)
                   .defined(definedFunction)
                   .interpolate(this._interpolationMode);
    }

    protected _drawStep(step: AppliedDrawStep) {
      if (this._drawLine) {
        super._drawStep(step);
      } else {
        // HACKHACK Forced to use anycast to access protected var
        (<any> AbstractDrawer).prototype._drawStep.call(this, step);
      }
      var attrToProjector = <AttributeToAppliedProjector>_Util.Methods.copyMap(step.attrToProjector);
      var xFunction       = attrToProjector["x"];
      var y0Function      = attrToProjector["y0"];
      var y1Function      = attrToProjector["y"];
      var definedFunction = attrToProjector["defined"];
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];
      if (attrToProjector["defined"]) {
        delete attrToProjector["defined"];
      }

      attrToProjector["d"] = this._createArea(xFunction, y0Function, y1Function, definedFunction);

      if (attrToProjector["fill"]) {
        this._areaSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }
      if (attrToProjector["class"]) {
        this._areaSelection.attr("class", attrToProjector["class"]);
        this._areaSelection.classed(Area.AREA_CLASS, true);
        delete attrToProjector["class"];
      }

      step.animator.animate(this._areaSelection, attrToProjector);
    }

    public _getSelector(): string {
      return "path";
    }
  }
}
}
