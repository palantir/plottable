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

      if (attrToProjector["fill"]) {
        this._areaSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }

      step.animator.animate(this._areaSelection, attrToProjector);
      this._areaSelection.classed(Area.AREA_CLASS, true);
    }

    public _getSelector(): string {
      return "path";
    }
  }
}
}
