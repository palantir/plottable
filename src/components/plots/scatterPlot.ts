///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Scatter<X,Y> extends AbstractXYPlot<X,Y> {

    public _animators: Animator.PlotAnimatorMap = {
      "circles-reset" : new Animator.Null(),
      "circles"       : new Animator.Base()
        .duration(250)
        .delay(5)
    };

    /**
     * Constructs a ScatterPlot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>) {
      super(xScale, yScale);
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
    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      attrToSet = attrToSet === "cx" ? "x" : attrToSet;
      attrToSet = attrToSet === "cy" ? "y" : attrToSet;
      super.project(attrToSet, accessor, scale);
      return this;
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      attrToProjector["cx"] = attrToProjector["x"];
      delete attrToProjector["x"];
      attrToProjector["cy"] = attrToProjector["y"];
      delete attrToProjector["y"];
      return attrToProjector;
    }

    // HACKHACK #1106 - should use drawers for paint logic
    public _paint() {
      var attrToProjector = this._generateAttrToProjector();
      var datasets = this.datasets();

      this._getDrawersInOrder().forEach((d, i) => {
        var dataset = datasets[i];
        var circles = d._renderArea.selectAll("circle").data(dataset.data());
        circles.enter().append("circle");

        if (this._dataChanged) {
          var rFunction = attrToProjector["r"];
          attrToProjector["r"] = () => 0;
          this._applyAnimatedAttributes(circles, "circles-reset", attrToProjector);
          attrToProjector["r"] = rFunction;
        }

        this._applyAnimatedAttributes(circles, "circles", attrToProjector);
        circles.exit().remove();
      });
    }
  }
}
}
