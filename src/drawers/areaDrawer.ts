///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Area extends Line {
    public static AREA_CLASS = "area";

    private _areaSelection: D3.Selection;

    protected _enterData(data: any[]) {
      // HACKHACK Forced to use anycast to access protected var
      (<any> AbstractDrawer).prototype._enterData.call(this, data);
      this._areaSelection.datum(data);
    }

    public setup(area: D3.Selection) {
      this._areaSelection = area.append("path")
                               .classed(Area.AREA_CLASS, true)
                               .style({ "stroke": "none" });
      AbstractDrawer.prototype.setup.call(this, area);
    }

    protected _drawStep(step: AppliedDrawStep) {
      (<any> AbstractDrawer).prototype._drawStep.call(this, step);
      var attrToProjector = <AttributeToAppliedProjector>Utils.Methods.copyMap(step.attrToProjector);
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];
      if (attrToProjector["defined"]) {
        delete attrToProjector["defined"];
      }

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
