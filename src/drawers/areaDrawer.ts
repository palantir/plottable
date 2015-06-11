///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Area extends Line {
    public static PATH_CLASS = "area";

    protected _enterData(data: any[]) {
      this._selection().data(data);
    }

    public renderArea(): d3.Selection<void>;
    public renderArea(area: d3.Selection<void>): Drawer;
    public renderArea(area?: d3.Selection<void>): any {
      if (area == null) {
        return super.renderArea();
      }
      Drawer.prototype.renderArea.call(this, area);
      area.append("path").style("stroke", "none");
      return this;
    }

    protected _drawStep(step: AppliedDrawStep) {
      step.animator.animate(this._selection(), step.attrToAppliedProjector);
      this._selection().classed(Area.PATH_CLASS, true);
    }

    public selector(): string {
      return "path";
    }
  }
}
}
