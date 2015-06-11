///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Area extends Line {
    public static PATH_CLASS = "area";

    private _areaSelection: d3.Selection<void>;

    protected _enterData(data: any[]) {
      this._areaSelection.data(data);
    }

    public renderArea(): d3.Selection<void>;
    public renderArea(area: d3.Selection<void>): Drawer;
    public renderArea(area?: d3.Selection<void>): any {
      if (area == null) {
        return super.renderArea();
      }
      Drawer.prototype.renderArea.call(this, area);
      this._areaSelection = area.append("path").style("stroke", "none");
      return this;
    }

    protected _drawStep(step: AppliedDrawStep) {
      step.animator.animate(this._areaSelection, step.attrToAppliedProjector);
      this._areaSelection.classed(Area.PATH_CLASS, true);
    }

    public selector(): string {
      return "path";
    }
  }
}
}
