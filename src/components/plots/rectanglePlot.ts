///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Rectangle<X, Y> extends XYPlot<X, Y> {
    private defaultFillColor: string;

    /**
     * Constructs a RectanglePlot.
     *
     * A RectanglePlot consists of a bunch of rectangles. The user is required to
     * project the left and right bounds of the rectangle (x1 and x2 respectively)
     * as well as the bottom and top bounds (y1 and y2 respectively)
     *
     * @constructor
     * @param {Scale.Scale} xScale The x scale to use.
     * @param {Scale.Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale<X, any>, yScale: Scale<Y, any>) {
      super(xScale, yScale);
      this.defaultFillColor = new Scales.Color().range()[0];
      this.classed("rectangle-plot", true);
    }

    protected generateAttrToProjector() {
      var attrToProjector = super.generateAttrToProjector();

      // Copy each of the different projectors.
      var x1Attr = attrToProjector["x1"];
      var y1Attr = attrToProjector["y1"];
      var x2Attr = attrToProjector["x2"];
      var y2Attr = attrToProjector["y2"];

      // Generate width based on difference, then adjust for the correct x origin
      attrToProjector["width"] = (d, i, u, m) => Math.abs(x2Attr(d, i, u, m) - x1Attr(d, i, u, m));
      attrToProjector["x"] = (d, i, u, m) => Math.min(x1Attr(d, i, u, m), x2Attr(d, i, u, m));

      // Generate height based on difference, then adjust for the correct y origin
      attrToProjector["height"] = (d, i, u, m) => Math.abs(y2Attr(d, i, u, m) - y1Attr(d, i, u, m));
      attrToProjector["y"] = (d, i, u, m) => Math.max(y1Attr(d, i, u, m), y2Attr(d, i, u, m)) - attrToProjector["height"](d, i, u, m);

      // Clean up the attributes projected onto the SVG elements
      delete attrToProjector["x1"];
      delete attrToProjector["y1"];
      delete attrToProjector["x2"];
      delete attrToProjector["y2"];


      attrToProjector["fill"] = attrToProjector["fill"] || d3.functor(this.defaultFillColor);
      return attrToProjector;
    }

    protected generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this.generateAttrToProjector(), animator: this._getAnimator("rectangles")}];
    }

    protected getDrawer(key: string) {
      return new Drawers.Rect(key, true);
    }
  }
}
}
