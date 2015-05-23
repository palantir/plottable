///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Line extends AbstractDrawer {
    public static LINE_CLASS = "line";

    private _pathSelection: D3.Selection;

    protected _enterData(data: any[]) {
      super._enterData(data);
      this._pathSelection.datum(data);
    }

    public setup(area: D3.Selection) {
      this._pathSelection = area.append("path")
                               .classed(Line.LINE_CLASS, true);
      super.setup(area);
    }

    protected _numberOfAnimationIterations(data: any[]): number {
      return 1;
    }

    protected _drawStep(step: AppliedDrawStep) {
      super._drawStep(step);
      var attrToProjector = <AttributeToAppliedProjector>Utils.Methods.copyMap(step.attrToProjector);

      if (attrToProjector["class"]) {
        this._pathSelection.attr("class", attrToProjector["class"]);
        this._pathSelection.classed(Line.LINE_CLASS, true);
        delete attrToProjector["class"];
      }

      step.animator.animate(this._pathSelection, attrToProjector);
    }

    public _getSelector() {
      return "." + Line.LINE_CLASS;
    }

    public _getSelection(index: number): D3.Selection {
      return this._getRenderArea().select(this._getSelector());
    }
  }
}
}
