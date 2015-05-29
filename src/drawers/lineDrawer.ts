///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Line extends Drawer {
    public static PATH_CLASS = "line";

    private _pathSelection: D3.Selection;

    protected _enterData(data: any[]) {
      super._enterData(data);
      this._pathSelection.datum(data);
    }

    public setup(line: D3.Selection) {
      this._pathSelection = line.append("path")
                                .classed(Line.PATH_CLASS, true)
                                .style("fill", "none");
      super.setup(line);
    }

    protected _numberOfAnimationIterations(data: any[]): number {
      return 1;
    }

    protected _drawStep(step: AppliedDrawStep) {
      var attrToProjector = <AttributeToAppliedProjector>Utils.Methods.copyMap(step.attrToProjector);
      step.animator.animate(this._pathSelection, attrToProjector);
      this._pathSelection.classed(Line.PATH_CLASS, true);
    }

    public _getSelector() {
      return "." + Line.PATH_CLASS;
    }

    public _getSelection(index: number): D3.Selection {
      return this._getRenderArea().select(this._getSelector());
    }
  }
}
}
