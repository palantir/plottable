///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Grid<X, Y> extends Rectangle<any, any> {

    /**
     * Constructs a GridPlot.
     *
     * A GridPlot is used to shade a grid of data. Each datum is a cell on the
     * grid, and the datum can control what color it is.
     *
     * @constructor
     * @param {Scale.Scale} xScale The x scale to use.
     * @param {Scale.Scale} yScale The y scale to use.
     * @param {Scale.Color|Scale.InterpolatedColor} colorScale The color scale
     * to use for each grid cell.
     */
    constructor(xScale: Scale<X, any>, yScale: Scale<Y, any>) {
      super(xScale, yScale);
      this.classed("grid-plot", true);

      // The x and y scales should render in bands with no padding for category scales
      if (xScale instanceof Scales.Category) {
        (<Scales.Category> <any> xScale).innerPadding(0).outerPadding(0);
      }
      if (yScale instanceof Scales.Category) {
        (<Scales.Category> <any> yScale).innerPadding(0).outerPadding(0);
      }

      this.animator("cells", new Animators.Null());
    }

    public addDataset(dataset: Dataset) {
      if (this._datasetKeysInOrder.length === 1) {
        Utils.Methods.warn("Only one dataset is supported in Grid plots");
        return this;
      }
      super.addDataset(dataset);
      return this;
    }

    protected _getDrawer(key: string) {
      return new Drawers.Rect(key, true);
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("cells")}];
    }

    public x(x?: number | Accessor<number> | X | Accessor<X>, scale?: Scale<X, number>): any {
      if (x == null) {
        return super.x();
      }
      if (scale == null) {
        super.x(<number | Accessor<number>> x);
      } else {
        super.x(<X | Accessor<X>> x, scale);
        if (scale instanceof Scales.Category) {
          var catScale = (<Scales.Category> <any> scale);
          this.x1((d, i, dataset, m) => scale.scale(this.x().accessor(d, i, dataset, m)) - catScale.rangeBand() / 2);
          this.x2((d, i, dataset, m) => scale.scale(this.x().accessor(d, i, dataset, m)) + catScale.rangeBand() / 2);
        } else if (scale instanceof QuantitativeScale) {
          this.x1((d, i, dataset, m) => scale.scale(this.x().accessor(d, i, dataset, m)));
        }
      }
      return this;
    }

    public y(y?: number | Accessor<number> | Y | Accessor<Y>, scale?: Scale<Y, number>): any {
      if (y == null) {
        return super.y();
      }
      if (scale == null) {
        super.y(<number | Accessor<number>> y);
      } else {
        super.y(<Y | Accessor<Y>> y, scale);
        if (scale instanceof Scales.Category) {
          var catScale = (<Scales.Category> <any> scale);
          this.y1((d, i, dataset, m) => scale.scale(this.y().accessor(d, i, dataset, m)) - catScale.rangeBand() / 2);
          this.y2((d, i, dataset, m) => scale.scale(this.y().accessor(d, i, dataset, m)) + catScale.rangeBand() / 2);
        } else if (scale instanceof QuantitativeScale) {
          this.y1((d, i, dataset, m) => scale.scale(this.y().accessor(d, i, dataset, m)));
        }
      }
      return this;
    }
  }
}
}
