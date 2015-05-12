///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Grid extends Rectangle<any, any> {
    private _colorScale: Scale<any, string>;

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
    constructor(xScale: Scale<any, any>, yScale: Scale<any, any>,
      colorScale: Scale<any, string>) {
      super(xScale, yScale);
      this.classed("grid-plot", true);

      // The x and y scales should render in bands with no padding for category scales
      if (xScale instanceof Scales.Category) {
        xScale.innerPadding(0).outerPadding(0);
      }
      if (yScale instanceof Scales.Category) {
        yScale.innerPadding(0).outerPadding(0);
      }

      this._colorScale = colorScale;
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

    /**
     * @param {string} attrToSet One of ["x", "y", "x2", "y2", "fill"]. If "fill" is used,
     * the data should return a valid CSS color.
     */
    public project(attrToSet: string, accessor: any, scale?: Scale<any, any>) {
      super.project(attrToSet, accessor, scale);

      if (attrToSet === "x") {
        if (scale instanceof Scales.Category) {
          this.project("x1", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this._attrBindings.get("x").accessor(d, i, dataset, m)) - scale.rangeBand() / 2;
          });
          this.project("x2", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this._attrBindings.get("x").accessor(d, i, dataset, m)) + scale.rangeBand() / 2;
          });
        }
        if (scale instanceof QuantitativeScale) {
          this.project("x1", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this._attrBindings.get("x").accessor(d, i, dataset, m));
          });
        }
      }

      if (attrToSet === "y") {
        if (scale instanceof Scales.Category) {
          this.project("y1", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this._attrBindings.get("y").accessor(d, i, dataset, m)) - scale.rangeBand() / 2;
          });
          this.project("y2", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this._attrBindings.get("y").accessor(d, i, dataset, m)) + scale.rangeBand() / 2;
          });
        }
        if (scale instanceof QuantitativeScale) {
          this.project("y1", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this._attrBindings.get("y").accessor(d, i, dataset, m));
          });
        }
      }

      if (attrToSet === "fill") {
        this._colorScale = this._attrBindings.get("fill").scale;
      }

      return this;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("cells")}];
    }

    public x(): Plots.AccessorScaleBinding<any, number>;
    public x(x: number | _Accessor): Grid;
    public x(x: any | _Accessor, scale: Scale<any, number>): Grid;
    public x(x?: number | _Accessor | any, scale?: Scale<any, number>): any {
      if (x == null) {
        return super.x();
      }
      if (scale == null) {
        super.x(<number | _Accessor> x);
      } else {
        super.x(<any | _Accessor> x, scale);
        if (scale instanceof Scales.Category) {
          this.project("x1", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this.x().accessor(d, i, dataset, m)) - scale.rangeBand() / 2;
          });
          this.project("x2", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this.x().accessor(d, i, dataset, m)) + scale.rangeBand() / 2;
          });
        } else if (scale instanceof QuantitativeScale) {
          this.project("x1", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this.x().accessor(d, i, dataset, m));
          });
        }
      }
      return this;
    }

    public y(): Plots.AccessorScaleBinding<any, number>;
    public y(y: number | _Accessor): Grid;
    public y(y: any | _Accessor, scale: Scale<any, number>): Grid;
    public y(y?: number | _Accessor | any, scale?: Scale<any, number>): any {
      if (y == null) {
        return super.y();
      }
      if (scale == null) {
        super.y(<number | _Accessor> y);
      } else {
        super.y(<any | _Accessor> y, scale);
        if (scale instanceof Scales.Category) {
          this.project("y1", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this.y().accessor(d, i, dataset, m)) - scale.rangeBand() / 2;
          });
          this.project("y2", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this.y().accessor(d, i, dataset, m)) + scale.rangeBand() / 2;
          });
        } else if (scale instanceof QuantitativeScale) {
          this.project("y1", (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
            return scale.scale(this.y().accessor(d, i, dataset, m));
          });
        }
      }
      return this;
    }
  }
}
}
