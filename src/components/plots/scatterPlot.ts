///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Scatter extends Abstract.XYPlot {

    public _animators: IPlotAnimatorMap = {
      "circles-reset" : new Animator.Null(),
      "circles"       : new Animator.IterativeDelay()
        .duration(250)
        .delay(5)
    };

    /**
     * Creates a Plot.Scatter.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(dataset, xScale, yScale);
      this.classed("scatter-plot", true);
      this.project("r", 3); // default
      this.project("opacity", 0.6); // default
      this.project("fill", () => Core.Colors.INDIGO); // default
    }

    /**
     * @param {string} attrToSet One of ["x", "y", "cx", "cy", "r",
     * "fill"]. "cx" and "cy" are aliases for "x" and "y". "r" is the datum's
     * radius, and "fill" is the CSS color of the datum.
     */
    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale) {
      attrToSet = attrToSet === "cx" ? "x" : attrToSet;
      attrToSet = attrToSet === "cy" ? "y" : attrToSet;
      super.project(attrToSet, accessor, scale);
      return this;
    }

    public _paint() {
      super._paint();

      var attrToProjector   = this._generateAttrToProjector();
      attrToProjector["cx"] = attrToProjector["x"];
      attrToProjector["cy"] = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];

      var circles = this._renderArea.selectAll("circle").data(this._dataSource.data());
      circles.enter().append("circle");

      if (this._dataChanged) {
        var rFunction = attrToProjector["r"];
        attrToProjector["r"] = () => 0;
        this._applyAnimatedAttributes(circles, "circles-reset", attrToProjector);
        attrToProjector["r"] = rFunction;
      }

      this._applyAnimatedAttributes(circles, "circles", attrToProjector);
      circles.exit().remove();
    }
  }
}
}
