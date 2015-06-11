///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Line extends Drawer {
    public static PATH_CLASS = "line";

    protected _enterData(data: any[]) {
      super._enterData(data);
      this._selection().data(data);
    }

    public renderArea(): d3.Selection<void>;
    public renderArea(area: d3.Selection<void>): Drawer;
    public renderArea(area?: d3.Selection<void>): any {
      if (area == null) {
        return super.renderArea();
      }
      super.renderArea(area);
      area.append("path").classed(Line.PATH_CLASS, true)
                         .style("fill", "none");
      return this;
    }

    protected _numberOfAnimationIterations(data: any[]): number {
      return 1;
    }

    protected _drawStep(step: AppliedDrawStep) {
      step.animator.animate(this._selection(), step.attrToAppliedProjector);
      this._selection().classed(Line.PATH_CLASS, true);
    }

    public selector() {
      return "path";
    }

    public selectionForIndex(index: number) {
      return this.renderArea().select(this.selector());
    }
  }
}
}
