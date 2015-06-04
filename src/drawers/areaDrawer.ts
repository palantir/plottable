///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Area extends Line {
    public static PATH_CLASS = "area";

    private _areaSelection: d3.Selection<void>;

    protected _enterData(data: any[]) {
      this._areaSelection.datum(data);
    }

    public setup(area: d3.Selection<void>) {
      Drawer.prototype.setup.call(this, area);
      this._areaSelection = area.append("path").style("stroke", "none");
    }

    protected _drawStep(step: AppliedDrawStep) {
      var attrToProjector = <AttributeToAppliedProjector>Utils.Methods.copyMap(step.attrToAppliedProjector);
      step.animator.animate(this._areaSelection, attrToProjector);
      this._areaSelection.classed(Area.PATH_CLASS, true);
    }

    public selector(): string {
      return "path";
    }
  }
}
}
