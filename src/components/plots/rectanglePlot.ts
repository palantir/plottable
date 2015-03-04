///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Rectangle<X, Y> extends AbstractXYPlot<X, Y> {

    /**
     * Constructs a RectanglePlot.
     *
     * A RectanglePlot consists of a bunch of rectangles. The user is required to
     * project the left and right bounds of the rectangle (x1 and x2 respectively)
     * as well as the bottom and top bounds (y1 and y2 respectively)
     *
     * @constructor
     * @param {Scale.AbstractScale} xScale The x scale to use.
     * @param {Scale.AbstractScale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractScale<X, any>, yScale: Scale.AbstractScale<Y, any>) {
      super(xScale, yScale);
      this.classed("rectangle-plot", true);
    }

    protected _getDrawer(key: string) {
      return new _Drawer.Rect(key, true);
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      // Copy each of the different projectors
      var x1Attr = attrToProjector["x"];
      var y1Attr = attrToProjector["y"];
      var x2Attr = attrToProjector["x2"];
      var y2Attr = attrToProjector["y2"];

      // Define width if both x1 and x2 are defined
      if (x1Attr !== undefined && x2Attr !== undefined) {
        attrToProjector["width"] = (d, i, u, m) => Math.abs(x2Attr(d, i, u, m) - x1Attr(d, i, u, m));
        attrToProjector["x"] = (d, i, u, m) => {
          return x1Attr(d, i, u, m) < x2Attr(d, i, u, m) ? x1Attr(d, i, u, m) : x2Attr(d, i, u, m);
        };
      }

      // Define height if both y1 and y2 are defined
      if (y1Attr !== undefined && y2Attr !== undefined) {
        attrToProjector["height"] = (d, i, u, m) => Math.abs(y2Attr(d, i, u, m) - y1Attr(d, i, u, m));
        attrToProjector["y"] = (d, i, u, m) => {
          return y1Attr(d, i, u, m) > y2Attr(d, i, u, m) ? y1Attr(d, i, u, m) - attrToProjector["height"](d, i, u, m) :
                                                           y2Attr(d, i, u, m) - attrToProjector["height"](d, i, u, m);
        };
      }

      return attrToProjector;
    }

    protected _generateDrawSteps(): _Drawer.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("rectangles")}];
    }
  }
}
}
