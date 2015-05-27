///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Rectangle<X, Y> extends XYPlot<X, Y> {
    private static _X2_KEY = "x2";
    private static _Y2_KEY = "y2";

    /**
     * Constructs a RectanglePlot.
     *
     * A RectanglePlot consists of a bunch of rectangles. The user is required to
     * project the left and right bounds of the rectangle (x and x1 respectively)
     * as well as the bottom and top bounds (y and y1 respectively). If x1/y1 is
     * not set, the plot will apply auto-centering logic to the extent of x/y
     *
     * @constructor
     * @param {Scale.Scale} xScale The x scale to use.
     * @param {Scale.Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale<X, any>, yScale: Scale<Y, any>) {
      super(xScale, yScale);

      this.animator("rectangles", new Animators.Null());
      this.classed("rectangle-plot", true);

      // The x and y scales should render in bands with no padding for category scales
      if (xScale instanceof Scales.Category) {
        (<Scales.Category> <any> xScale).innerPadding(0).outerPadding(0);
      }
      if (yScale instanceof Scales.Category) {
        (<Scales.Category> <any> yScale).innerPadding(0).outerPadding(0);
      }
    }

    protected _getDrawer(dataset: Dataset) {
      return new Drawers.Rect(dataset, true);
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      // Copy each of the different projectors.
      var xAttr = attrToProjector[Rectangle._X_KEY];
      var x2Attr = attrToProjector[Rectangle._X2_KEY];
      var yAttr = attrToProjector[Rectangle._Y_KEY];
      var y2Attr = attrToProjector[Rectangle._Y2_KEY];

      var xScale = this.x().scale;
      var yScale = this.y().scale;

      if (x2Attr != null) {
        attrToProjector["width"] = (d, i, dataset) => Math.abs(x2Attr(d, i, dataset) - xAttr(d, i, dataset));
        attrToProjector["x"] = (d, i, dataset) => Math.min(x2Attr(d, i, dataset), xAttr(d, i, dataset));
      } else {
        attrToProjector["width"] = (d, i, dataset) => this._rectangleWidth(xScale);
        attrToProjector["x"] = (d, i, dataset) => xAttr(d, i, dataset) - 0.5 * attrToProjector["width"](d, i, dataset);
      }

      if (y2Attr != null) {
        attrToProjector["height"] = (d, i, dataset) => Math.abs(y2Attr(d, i, dataset) - yAttr(d, i, dataset));
        attrToProjector["y"] = (d, i, dataset) => {
	        return Math.max(y2Attr(d, i, dataset), yAttr(d, i, dataset)) - attrToProjector["height"](d, i, dataset);
        };
      } else {
        attrToProjector["height"] = (d, i, dataset) => this._rectangleWidth(yScale);
        attrToProjector["y"] = (d, i, dataset) => yAttr(d, i, dataset) - 0.5 * attrToProjector["height"](d, i, dataset);
      }

      // Clean up the attributes projected onto the SVG elements
      delete attrToProjector[Rectangle._X2_KEY];
      delete attrToProjector[Rectangle._Y2_KEY];

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
        return super.x();
      }
      if (scale == null) {
        return super.x(<number | Accessor<number>> x);
      }
      return super.x(<X | Accessor<X>> x, scale);
    }

    public x2(): AccessorScaleBinding<X, number>;
    public x2(x2: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public x2(x2: X | Accessor<X>, scale: Scale<X, number>): Plots.Rectangle<X, Y>;
    public x2(x2?: number | Accessor<number> | X | Accessor<X>, scale?: Scale<X, number>): any {
      if (x2 == null) {
        return this._propertyBindings.get(Rectangle._X2_KEY);
      }
      this._bindProperty(Rectangle._X2_KEY, x2, scale);
      this.render();
      return this;
    }

    public y(): AccessorScaleBinding<Y, number>;
    public y(y: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public y(y: Y | Accessor<Y>, scale: Scale<Y, number>): Plots.Rectangle<X, Y>;
    public y(y?: number | Accessor<number> | Y | Accessor<Y>, scale?: Scale<Y, number>): any {
      if (y == null) {
        return super.y();
      }
      if (scale == null) {
        return super.y(<number | Accessor<number>> y);
      }
      return super.y(<Y | Accessor<Y>> y, scale);
    }

    public y2(): AccessorScaleBinding<Y, number>;
    public y2(y2: number | Accessor<number>): Plots.Rectangle<X, Y>;
    public y2(y2: Y | Accessor<Y>, scale: Scale<Y, number>): Plots.Rectangle<X, Y>;
    public y2(y2?: number | Accessor<number> | Y | Accessor<Y>, scale?: Scale<Y, number>): any {
      if (y2 == null) {
        return this._propertyBindings.get(Rectangle._Y2_KEY);
      }
      this._bindProperty(Rectangle._Y2_KEY, y2, scale);
      this.render();
      return this;
    }

    protected _propertyProjectors(): AttributeToProjector {
      var attrToProjector = super._propertyProjectors();
      if (this.x2() != null) {
        attrToProjector["x2"] = Plot._scaledAccessor(this.x2());
      }
      if (this.y2() != null) {
        attrToProjector["y2"] = Plot._scaledAccessor(this.y2());
      }
      return attrToProjector;
    }

    protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
      var attrToProjector = this._generateAttrToProjector();
      var rectX = attrToProjector["x"](datum, index, dataset);
      var rectY = attrToProjector["y"](datum, index, dataset);
      var rectWidth = attrToProjector["width"](datum, index, dataset);
      var rectHeight = attrToProjector["height"](datum, index, dataset);
      var x = rectX + rectWidth / 2;
      var y = rectY + rectHeight / 2;
      return { x: x, y: y };
    }

    private _rectangleWidth(scale: Scale<any, number>) {
      if (scale instanceof Plottable.Scales.Category) {
        return (<Plottable.Scales.Category> scale).rangeBand();
      } else {
        var accessor = scale === this.x().scale ? this.x().accessor : this.y().accessor;
        var accessorData = d3.set(Utils.Methods.flatten(this._datasetKeysInOrder.map((k) => {
          var dataset = this._key2PlotDatasetKey.get(k).dataset;
          return dataset.data().map((d, i) => accessor(d, i, dataset).valueOf());
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
