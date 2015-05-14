///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Rectangle<X, Y> extends XYPlot<X, Y> {
    private static _X1_KEY = "x1";
    private static _X2_KEY = "x2";
    private static _Y1_KEY = "y1";
    private static _Y2_KEY = "y2";
    private _defaultFillColor: string;

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
      this._defaultFillColor = new Scales.Color().range()[0];
      this.classed("rectangle-plot", true);
    }

    protected _getDrawer(key: string) {
      return new Drawers.Rect(key, true);
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      // Copy each of the different projectors.
      var x1Attr = attrToProjector["x1"];
      var y1Attr = attrToProjector["y1"];
      var x2Attr = attrToProjector["x2"];
      var y2Attr = attrToProjector["y2"];

      // Generate width based on difference, then adjust for the correct x origin
      attrToProjector["width"] = (d, i, dataset, m) => Math.abs(x2Attr(d, i, dataset, m) - x1Attr(d, i, dataset, m));
      attrToProjector["x"] = (d, i, dataset, m) => Math.min(x1Attr(d, i, dataset, m), x2Attr(d, i, dataset, m));

      // Generate height based on difference, then adjust for the correct y origin
      attrToProjector["height"] = (d, i, dataset, m) => Math.abs(y2Attr(d, i, dataset, m) - y1Attr(d, i, dataset, m));
      attrToProjector["y"] = (d, i, dataset, m) => {
        return Math.max(y1Attr(d, i, dataset, m), y2Attr(d, i, dataset, m)) - attrToProjector["height"](d, i, dataset, m);
      };

      // Clean up the attributes projected onto the SVG elements
      delete attrToProjector["x1"];
      delete attrToProjector["y1"];
      delete attrToProjector["x2"];
      delete attrToProjector["y2"];

      attrToProjector["fill"] = attrToProjector["fill"] || d3.functor(this._defaultFillColor);
      return attrToProjector;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("rectangles")}];
    }

    public x1<X1>(): AccessorScaleBinding<X1, number>;
    public x1(x1: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public x1<X1>(x1: X | Accessor<X>, scale: Scale<X1, number>): Plots.Rectangle<X, Y>;
    public x1<X1>(x1?: number | Accessor<number> | X1 | Accessor<X1>, scale?: Scale<X1, number>): any {
      if (x1 == null) {
        return this._propertyBindings.get(Rectangle._X1_KEY);
      }
      this._bindProperty(Rectangle._X1_KEY, x1, scale);
      this._render();
      return this;
    }

    public x2<X2>(): AccessorScaleBinding<X2, number>;
    public x2(x2: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public x2<X2>(x2: X2 | Accessor<X2>, scale: Scale<X2, number>): Plots.Rectangle<X, Y>;
    public x2<X2>(x2?: number | Accessor<number> | X2 | Accessor<X2>, scale?: Scale<X2, number>): any {
      if (x2 == null) {
        return this._propertyBindings.get(Rectangle._X2_KEY);
      }
      this._bindProperty(Rectangle._X2_KEY, x2, scale);
      this._render();
      return this;
    }

    public y1<Y1>(): AccessorScaleBinding<Y1, number>;
    public y1(y1: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public y1<Y1>(y1: Y1 | Accessor<Y1>, scale: Scale<Y1, number>): Plots.Rectangle<X, Y>;
    public y1<Y1>(y1?: number | Accessor<number> | Y1 | Accessor<Y1>, scale?: Scale<Y1, number>): any {
      if (y1 == null) {
        return this._propertyBindings.get(Rectangle._Y1_KEY);
      }
      this._bindProperty(Rectangle._Y1_KEY, y1, scale);
      this._render();
      return this;
    }

    public y2<Y2>(): AccessorScaleBinding<Y2, number>;
    public y2(y2: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public y2<Y2>(y2: Y2 | Accessor<Y>, scale: Scale<Y2, number>): Plots.Rectangle<X, Y>;
    public y2<Y2>(y2?: number | Accessor<number> | Y2 | Accessor<Y2>, scale?: Scale<Y2, number>): any {
      if (y2 == null) {
        return this._propertyBindings.get(Rectangle._Y2_KEY);
      }
      this._bindProperty(Rectangle._Y2_KEY, y2, scale);
      this._render();
      return this;
    }
  }
}
}
