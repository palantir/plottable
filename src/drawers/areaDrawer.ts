///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Area extends Line {
    private areaSelection: D3.Selection;
    private _drawLine = true;

    public _enterData(data: any[]) {
      if (this._drawLine) {
        super._enterData(data);
      } else {
        AbstractDrawer.prototype._enterData.call(this, data);
      }
      this.areaSelection.datum(data);
    }

    /**
     * Sets the value determining if line should be drawn.
     *
     * @param{boolean} draw The value determing if line should be drawn.
     */
    public drawLine(draw: boolean): Area {
      this._drawLine = draw;
      return this;
    }

    public setup(area: D3.Selection) {
      // area.append("path").classed("area", true);
      this.areaSelection = area.append("path")
                               .classed("area", true)
                               .style({ "stroke": "none" });
      if (this._drawLine) {
        super.setup(area);
      } else {
        AbstractDrawer.prototype.setup.call(this, area);
      }
      // this.areaSelection = this._renderArea.select(".area");
    }

    private createArea(xFunction: AppliedAccessor,
                       y0Function: AppliedAccessor,
                       y1Function: AppliedAccessor,
                       definedFunction: (d: any, i: number) => boolean) {
      if(!definedFunction) {
        definedFunction = () => true;
      }

      return d3.svg.area()
                   .x(xFunction)
                   .y0(y0Function)
                   .y1(y1Function)
                   .defined(definedFunction);
    }

    public _drawStep(step: DrawStep) {
      if (this._drawLine) {
        super._drawStep(step);
      } else {
        AbstractDrawer.prototype._drawStep.call(this, step);
      }

      var attrToProjector = <AttributeToProjector>_Util.Methods.copyMap(step.attrToProjector);
      var xFunction       = attrToProjector["x"];
      var y0Function      = attrToProjector["y0"];
      var y1Function      = attrToProjector["y"];
      var definedFunction = attrToProjector["defined"];
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];

      attrToProjector["d"] = this.createArea(xFunction, y0Function, y1Function, attrToProjector["defined"]);
      if (attrToProjector["defined"]) {
        delete attrToProjector["defined"];
      }

      if (attrToProjector["fill"]) {
        this.areaSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }
      step.animator.animate(this.areaSelection, attrToProjector);
    }
  }
}
}
