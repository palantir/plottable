///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Area extends Path {
    private areaSelection: D3.Selection;

    public _applyData(data: any[]) {
      super._applyData(data);
      this.areaSelection.datum(data);
    }

    public setup(area: D3.Selection) {
      area.append("path").classed("area", true)
      super.setup(area);
      this.areaSelection = this._renderArea.select(".area");
    }

    public _drawStep(step: DrawStep) {
      super._drawStep(step); 
      var attrToProjector = step.attrToProjector;

      if (attrToProjector["fill"]) {
        this.areaSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }
      var animator = step.animator || new Animator.Null();
      animator.animate(this.areaSelection, attrToProjector);
    }
  }
}
}
