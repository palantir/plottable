///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Area extends Line {
    public static PATH_CLASS = "area";

    protected _setDefaultAttributes(selection: d3.Selection<any>) {
      (<any> Drawer).prototype._setDefaultAttributes(selection);
      selection.classed(Area.PATH_CLASS, true)
               .style("stroke", "none");
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
