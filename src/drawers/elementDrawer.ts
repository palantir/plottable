///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Element extends Drawer {
    protected _svgElement: string;

    protected _drawStep(step: AppliedDrawStep) {
      super._drawStep(step);
      var drawSelection = this._selection();
      if (step.attrToAppliedProjector["fill"]) {
        drawSelection.attr("fill", step.attrToAppliedProjector["fill"]); // so colors don't animate
      }
      step.animator.animate(drawSelection, step.attrToAppliedProjector);
    }

    protected _enterData(data: any[]) {
      super._enterData(data);
      var dataElements = this._selection().data(data);
      dataElements.enter().append(this._svgElement);
      if (this._className != null) {
        dataElements.classed(this._className, true);
      }
      dataElements.exit().remove();
    }

    public selector(): string {
      return this._svgElement;
    }
  }
}
}
