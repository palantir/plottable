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
      this.pathSelection = area.append("path")
                               .classed("line", true)
                               .style({
                                 "fill": "none",
                                 "vector-effect": "non-scaling-stroke"
                               });
      super.setup(area);
    }

    private createLine(xFunction: _AppliedProjector, yFunction: _AppliedProjector, definedFunction: _AppliedProjector) {
      if(!definedFunction) {
        definedFunction = (d, i) => true;
      }

      return d3.svg.line()
                   .x(xFunction)
                   .y(yFunction)
                   .defined(definedFunction);
    }

    public _numberOfAnimationIterations(data: any[]): number {
      return 1;
    }

    public _drawStep(step: AppliedDrawStep) {
      var baseTime = super._drawStep(step);
      var attrToProjector = <_AttributeToAppliedProjector>_Util.Methods.copyMap(step.attrToProjector);
      var xFunction       = attrToProjector["x"];
      var yFunction       = attrToProjector["y"];
      var definedFunction = attrToProjector["defined"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];
      if (attrToProjector["defined"]) {
        delete attrToProjector["defined"];
      }

      attrToProjector["d"] = this.createLine(xFunction, yFunction, definedFunction);

      if (attrToProjector["fill"]) {
        this.pathSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }
      step.animator.animate(this.pathSelection, attrToProjector);
    }
  }
}
}
