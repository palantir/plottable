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

    private createArea(xFunction: AppliedAccessor, y0Function: AppliedAccessor, y1Function: AppliedAccessor) {
      return d3.svg.area()
              .x(xFunction)
              .y0(y0Function)
              .y1(y1Function)
              .defined((d, i) => this._rejectNullsAndNaNs(d, i, xFunction) && this._rejectNullsAndNaNs(d, i, y0Function) && this._rejectNullsAndNaNs(d, i, y1Function));
    }

    public _drawStep(step: DrawStep) {
      super._drawStep(step); 
      var attrToProjector = step.attrToProjector;
      var xFunction       = attrToProjector["x"];
      var y0Function      = attrToProjector["y0"];
      var y1Function       = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];
      
      var area = this.createArea(xFunction, y0Function, y1Function);
      attrToProjector["d"] = area;

      if (attrToProjector["fill"]) {
        this.areaSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }
      var animator = step.animator || new Animator.Null();
      animator.animate(this.areaSelection, attrToProjector);
      attrToProjector["x"] = xFunction;
      attrToProjector["y0"] = y0Function;
      attrToProjector["y"] = y1Function;
    }
  }
}
}
