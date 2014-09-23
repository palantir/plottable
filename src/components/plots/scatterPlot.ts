///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Scatter<X,Y> extends Abstract.NSXYPlot<X,Y> {

    public _animators: Animator.IPlotAnimatorMap = {
      "circles-reset" : new Animator.Null(),
      "circles"       : new Animator.IterativeDelay()
        .duration(250)
        .delay(5)
    };

    /**
     * Constructs a ScatterPlot.
     *
     * @constructor
     * @param {IDataset | any} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Abstract.Scale<X, number>, yScale: Abstract.Scale<Y, number>) {
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
    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale<any, any>) {
      attrToSet = attrToSet === "cx" ? "x" : attrToSet;
      attrToSet = attrToSet === "cy" ? "y" : attrToSet;
      super.project(attrToSet, accessor, scale);
      return this;
    }

    public _generateAttrToProjector() {
      var a2p = super._generateAttrToProjector();
      a2p["cx"] = a2p["x"];
      delete a2p["x"];
      a2p["cy"] = a2p["y"];
      delete a2p["y"];
      return a2p;
    }

    public _paint() {
      var attrToProjector = this._generateAttrToProjector();
      var datasets = this._getDatasetsInOrder();

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
