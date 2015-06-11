///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Line extends Drawer {
    public static PATH_CLASS = "line";

    protected _setDefaultAttributes(selection: d3.Selection<any>) {
      super._setDefaultAttributes(selection);
      selection.classed(Line.PATH_CLASS, true)
                         .style("fill", "none");
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
