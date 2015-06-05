///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Line extends Drawer {
    public static PATH_CLASS = "line";

    private _pathSelection: d3.Selection<void>;

    protected _enterData(data: any[]) {
      super._enterData(data);
      this._pathSelection.datum(data);
    }

    public renderArea(): d3.Selection<void>;
    public renderArea(area: d3.Selection<void>): Drawer;
    public renderArea(area?: d3.Selection<void>): any {
      if (area == null) {
        return super.renderArea();
      }
      super.renderArea(area);
      this._pathSelection = area.append("path")
                                .classed(Line.PATH_CLASS, true)
                                .style("fill", "none");
      return this;
    }

    protected _numberOfAnimationIterations(data: any[]): number {
      return 1;
    }

    protected _drawStep(step: AppliedDrawStep) {
      var attrToProjector = <AttributeToAppliedProjector>Utils.Methods.copyMap(step.attrToAppliedProjector);
      step.animator.animate(this._pathSelection, attrToProjector);
      this._pathSelection.classed(Line.PATH_CLASS, true);
    }

    public selector() {
      return "." + Line.PATH_CLASS;
    }

    public selectionForIndex(index: number) {
      return this.renderArea().select(this.selector());
    }
  }
}
}
