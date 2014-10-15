///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Path extends AbstractDrawer {
    private pathSelection: D3.Selection;

    public _applyData(data: any[]) {
      super._applyData(data);
      this.pathSelection.datum(data);
    }

    public setup(area: D3.Selection) {
      area.append("path").classed("line", true)
      super.setup(area);
      this.pathSelection = this._renderArea.select(".line");
    }

    public _drawStep(step: DrawStep) {
      super._drawStep(step);
      var attrToProjector = step.attrToProjector;
      
      if (attrToProjector["fill"]) {
        this.pathSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }
      var animator = step.animator || new Animator.Null();
      animator.animate(this.pathSelection, attrToProjector);
    }
  }
}
}
