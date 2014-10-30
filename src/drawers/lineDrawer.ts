///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Line extends AbstractDrawer {
    private pathSelection: D3.Selection;

    public _enterData(data: any[]) {
      super._enterData(data);
      this.pathSelection.datum(data);
    }

    public setup(area: D3.Selection) {
      // area.append("path").classed("line", true);
      this.pathSelection = area.append("path")
                               .classed("line", true)
                               .style({
                                 "fill": "none",
                                 "vector-effect": "non-scaling-stroke"
                               });
      super.setup(area);
      // this.pathSelection = this._renderArea.select(".line");
    }

    private createLine(xFunction: AppliedAccessor, yFunction: AppliedAccessor, definedFunction: (d: any, i: number) => boolean) {
      if(!definedFunction) {
        definedFunction = () => true;
      }

      return d3.svg.line()
                   .x(xFunction)
                   .y(yFunction)
                   .defined(definedFunction);
    }

    public _numberOfAnimationIterations(data: any[]): number {
      return 1;
    }

    public _drawStep(step: DrawStep) {
      var baseTime = super._drawStep(step);
      var attrToProjector = <AttributeToProjector>_Util.Methods.copyMap(step.attrToProjector);
      var xFunction       = attrToProjector["x"];
      var yFunction       = attrToProjector["y"];
      var definedFunction = attrToProjector["defined"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];

      attrToProjector["d"] = this.createLine(xFunction, yFunction, attrToProjector["defined"]);
      if (attrToProjector["defined"]) {
        delete attrToProjector["defined"];
      }

      if (attrToProjector["fill"]) {
        this.pathSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }
      step.animator.animate(this.pathSelection, attrToProjector);
    }
  }
}
}
