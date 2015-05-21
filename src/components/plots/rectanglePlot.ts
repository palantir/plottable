///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Rectangle<X, Y> extends XYPlot<X, Y> {
    private static _X1_KEY = "x1";
    private static _X2_KEY = "x2";
    private static _Y1_KEY = "y1";
    private static _Y2_KEY = "y2";

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
      this.classed("rectangle-plot", true);
      this.attr("fill", new Scales.Color().range()[0]);
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
      attrToProjector["width"] = (d, i, dataset) => Math.abs(x2Attr(d, i, dataset) - x1Attr(d, i, dataset));
      attrToProjector["x"] = (d, i, dataset) => Math.min(x1Attr(d, i, dataset), x2Attr(d, i, dataset));

      // Generate height based on difference, then adjust for the correct y origin
      attrToProjector["height"] = (d, i, dataset) => Math.abs(y2Attr(d, i, dataset) - y1Attr(d, i, dataset));
      attrToProjector["y"] = (d, i, dataset) => {
        return Math.max(y1Attr(d, i, dataset), y2Attr(d, i, dataset)) - attrToProjector["height"](d, i, dataset);
      };

      // Clean up the attributes projected onto the SVG elements
      delete attrToProjector["x1"];
      delete attrToProjector["y1"];
      delete attrToProjector["x2"];
      delete attrToProjector["y2"];

      return attrToProjector;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("rectangles")}];
    }

    public x1(): AccessorScaleBinding<X, number>;
    public x1(x1: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public x1(x1: X | Accessor<X>, scale: Scale<X, number>): Plots.Rectangle<X, Y>;
    public x1(x1?: number | Accessor<number> | X | Accessor<X>, scale?: Scale<X, number>): any {
      if (x1 == null) {
        return this._propertyBindings.get(Rectangle._X1_KEY);
      }
      this._bindProperty(Rectangle._X1_KEY, x1, scale);
      this.renderImmediately();
      return this;
    }

    public x2(): AccessorScaleBinding<X, number>;
    public x2(x2: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public x2(x2: X | Accessor<X>, scale: Scale<X, number>): Plots.Rectangle<X, Y>;
    public x2(x2?: number | Accessor<number> | X | Accessor<X>, scale?: Scale<X, number>): any {
      if (x2 == null) {
        return this._propertyBindings.get(Rectangle._X2_KEY);
      }
      this._bindProperty(Rectangle._X2_KEY, x2, scale);
      this.renderImmediately();
      return this;
    }

    public y1(): AccessorScaleBinding<Y, number>;
    public y1(y1: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public y1(y1: Y | Accessor<Y>, scale: Scale<Y, number>): Plots.Rectangle<X, Y>;
    public y1(y1?: number | Accessor<number> | Y | Accessor<Y>, scale?: Scale<Y, number>): any {
      if (y1 == null) {
        return this._propertyBindings.get(Rectangle._Y1_KEY);
      }
      this._bindProperty(Rectangle._Y1_KEY, y1, scale);
      this.renderImmediately();
      return this;
    }

    public y2(): AccessorScaleBinding<Y, number>;
    public y2(y2: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public y2(y2: Y | Accessor<Y>, scale: Scale<Y, number>): Plots.Rectangle<X, Y>;
    public y2(y2?: number | Accessor<number> | Y | Accessor<Y>, scale?: Scale<Y, number>): any {
      if (y2 == null) {
        return this._propertyBindings.get(Rectangle._Y2_KEY);
      }
      this._bindProperty(Rectangle._Y2_KEY, y2, scale);
      this.renderImmediately();
      return this;
    }

    protected _generatePropertyToProjectors(): AttributeToProjector {
      var attrToProjector = super._generatePropertyToProjectors();
      attrToProjector["x1"] = Plot._scaledAccessor(this.x1());
      attrToProjector["y2"] = Plot._scaledAccessor(this.y2());
      attrToProjector["x2"] = Plot._scaledAccessor(this.x2());
      attrToProjector["y1"] = Plot._scaledAccessor(this.y1());
      return attrToProjector;
    }
  }
}
}
