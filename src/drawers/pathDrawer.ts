///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Path extends AbstractDrawer {
    private pathSelection: D3.Selection;

    public _applyData(data: any[]) {
      super._applyData(data);
      this.pathSelection.datum(data);
    }

    public _rejectNullsAndNaNs(d: any, i: number, projector: AppliedAccessor) {
      var value = projector(d, i);
      return value != null && value === value;
    }

    public setup(area: D3.Selection) {
      area.append("path").classed("line", true)
      super.setup(area);
      this.pathSelection = this._renderArea.select(".line");
    }

    private createLine(xFunction: AppliedAccessor, yFunction: AppliedAccessor) {
      return d3.svg.line()
               .x(xFunction)
               .y(yFunction)
               .defined((d, i) => this._rejectNullsAndNaNs(d, i, xFunction) && this._rejectNullsAndNaNs(d, i, yFunction));
    }

    public _drawStep(step: DrawStep) {
      super._drawStep(step);
      var attrToProjector = step.attrToProjector;
      var xFunction       = attrToProjector["x"];
      var yFunction       = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];

      var line = this.createLine(xFunction, yFunction);
      attrToProjector["d"] = line;
      
      if (attrToProjector["fill"]) {
        this.pathSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }
      var animator = step.animator || new Animator.Null();
      animator.animate(this.pathSelection, attrToProjector);

      attrToProjector["x"] = xFunction;
      attrToProjector["y"] = yFunction;
    }
  }
}
}
