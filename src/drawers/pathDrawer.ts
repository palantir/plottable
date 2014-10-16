///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Path extends AbstractDrawer {
    private pathSelection: D3.Selection;

    public _enterData(data: any[]) {
      super._enterData(data);
      this.pathSelection.datum(data);
    }

    public setup(area: D3.Selection) {
      area.append("path").classed("line", true);
      super.setup(area);
      this.pathSelection = this._renderArea.select(".line");
    }

    private createLine(xFunction: AppliedAccessor, yFunction: AppliedAccessor, definedFunction: (d: any, i: number) => boolean) {
      return d3.svg.line()
               .x(xFunction)
               .y(yFunction)
               .defined(definedFunction);
    }

    public _drawStep(step: DrawStep) {
      super._drawStep(step);
      var attrToProjector = <AttributeToProjector>_Util.Methods.copyMap(step.attrToProjector);
      var xFunction       = attrToProjector["x"];
      var yFunction       = attrToProjector["y"];
      var definedFunction = attrToProjector["defined"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];
      if(definedFunction) {
        delete attrToProjector["defined"];
      } else {
        definedFunction = (d: any, i: number) => true;
      }

      var line = this.createLine(xFunction, yFunction, definedFunction);
      attrToProjector["d"] = line;

      if (attrToProjector["fill"]) {
        this.pathSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }
      var animator = step.animator || new Animator.Null();
      animator.animate(this.pathSelection, attrToProjector);
    }
  }
}
}
