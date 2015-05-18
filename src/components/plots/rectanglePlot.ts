///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Rectangle<X, Y> extends XYPlot<X, Y> {
    private static _X1_KEY = "x1";
    private static _Y1_KEY = "y1";

    /**
     * Constructs a RectanglePlot.
     *
     * A RectanglePlot consists of a bunch of rectangles. The user is required to
     * project the left and right bounds of the rectangle (x and x1 respectively)
     * as well as the bottom and top bounds (y and y1 respectively). If x1/y1 is
     * not set, the plot will apply auto-centering logic to the extent of x/y (all
     * values are treated as categories regardless of their scale)
     *
     * @constructor
     * @param {Scale.Scale} xScale The x scale to use.
     * @param {Scale.Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale<X, any>, yScale: Scale<Y, any>) {
      super(xScale, yScale);

      this.animator("cells", new Animators.Null());
      this.classed("rectangle-plot", true);

      // The x and y scales should render in bands with no padding for category scales
      if (xScale instanceof Scales.Category) {
        (<Scales.Category> <any> xScale).innerPadding(0).outerPadding(0);
      }
      if (yScale instanceof Scales.Category) {
        (<Scales.Category> <any> yScale).innerPadding(0).outerPadding(0);
      }
    }

    protected _getDrawer(key: string) {
      return new Drawers.Rect(key, true);
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      // Copy each of the different projectors.
      var xAttr = attrToProjector[Rectangle._X_KEY];
      var x1Attr = attrToProjector[Rectangle._X1_KEY];
      var yAttr = attrToProjector[Rectangle._Y_KEY];
      var y1Attr = attrToProjector[Rectangle._Y1_KEY];

      var xScale = this.x().scale;
      var yScale = this.y().scale;

      // In order to define a range from x, x1 has to also be set.
      // If x1 is not set, auto-centering logic will be applied to x.
      // The above also applies to y/y1.

      if (x1Attr != null) {
        attrToProjector["width"] = (d, i, dataset, m) => Math.abs(x1Attr(d, i, dataset, m) - xAttr(d, i, dataset, m));
        attrToProjector["x"] = (d, i, dataset, m) => Math.min(x1Attr(d, i, dataset, m), xAttr(d, i, dataset, m));
      } else {
        attrToProjector["width"] = (d, i, dataset, m) => this._rectangleWidth(xScale);
        attrToProjector["x"] = (d, i, dataset, m) => xAttr(d, i, dataset, m) - 0.5 * attrToProjector["width"](d, i, dataset, m);
      }

      if (y1Attr != null) {
        attrToProjector["height"] = (d, i, dataset, m) => Math.abs(y1Attr(d, i, dataset, m) - yAttr(d, i, dataset, m));
        attrToProjector["y"] = (d, i, dataset, m) => {
	        return Math.max(y1Attr(d, i, dataset, m), yAttr(d, i, dataset, m)) - attrToProjector["height"](d, i, dataset, m);
        };
      } else {
        attrToProjector["height"] = (d, i, dataset, m) => this._rectangleWidth(yScale);
        attrToProjector["y"] = (d, i, dataset, m) => yAttr(d, i, dataset, m) - 0.5 * attrToProjector["height"](d, i, dataset, m);
      }

      // Clean up the attributes projected onto the SVG elements
      delete attrToProjector["x1"];
      delete attrToProjector["y1"];

      return attrToProjector;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("rectangles")}];
    }

    public x(): AccessorScaleBinding<X, number>;
    public x(x: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public x(x: X | Accessor<X>, scale: Scale<X, number>): Plots.Rectangle<X, Y>;
    public x(x?: number | Accessor<number> | X | Accessor<X>, scale?: Scale<X, number>): any {
      if (x == null) {
        return this._propertyBindings.get(Rectangle._X_KEY);
      }
      this._bindProperty(Rectangle._X_KEY, x, scale);
      this.renderImmediately();
      return this;
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

    public y(): AccessorScaleBinding<Y, number>;
    public y(y: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public y(y: Y | Accessor<Y>, scale: Scale<Y, number>): Plots.Rectangle<X, Y>;
    public y(y?: number | Accessor<number> | Y | Accessor<Y>, scale?: Scale<Y, number>): any {
      if (y == null) {
        return this._propertyBindings.get(Rectangle._Y_KEY);
      }
      this._bindProperty(Rectangle._Y_KEY, y, scale);
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

    private _rectangleWidth(scale: Scale<any, number>) {
      if (scale instanceof Plottable.Scales.Category) {
        return (<Plottable.Scales.Category> scale).rangeBand();
      } else {
        var accessor = scale === this.x().scale ? this.x().accessor : this.y().accessor;
        var accessorData = d3.set(Utils.Methods.flatten(this._datasetKeysInOrder.map((k) => {
          var dataset = this._key2PlotDatasetKey.get(k).dataset;
          var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
          return dataset.data().map((d, i) => accessor(d, i, dataset, plotMetadata).valueOf());
        }))).values().map((value) => +value);
        // Get the absolute difference between min and max
        var min = Plottable.Utils.Methods.min(accessorData, 0);
        var max = Plottable.Utils.Methods.max(accessorData, 0);
        var scaledMin = scale.scale(min);
        var scaledMax = scale.scale(max);
        return (scaledMax - scaledMin) / Math.abs(max - min);
      }
    }

  }
}
}
