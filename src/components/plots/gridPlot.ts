///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Grid extends Rectangle<any, any> {
    private colorScale: Scale<any, string>;

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

      this.colorScale = colorScale;
      this.animator("cells", new Animators.Null());
    }

    public addDataset(keyOrDataset: any, dataset?: any) {
      if (this._datasetKeysInOrder.length === 1) {
        Utils.Methods.warn("Only one dataset is supported in Grid plots");
        return this;
      }
      super.addDataset(keyOrDataset, dataset);
      return this;
    }

    protected getDrawer(key: string) {
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
          this.project("x1", (d: any, i: number, u: any, m: Plots.PlotMetadata) => {
            return scale.scale(this.projections["x"].accessor(d, i, u, m)) - scale.rangeBand() / 2;
          });
          this.project("x2", (d: any, i: number, u: any, m: Plots.PlotMetadata) => {
            return scale.scale(this.projections["x"].accessor(d, i, u, m)) + scale.rangeBand() / 2;
          });
        }
        if (scale instanceof QuantitativeScale) {
          this.project("x1", (d: any, i: number, u: any, m: Plots.PlotMetadata) => {
            return scale.scale(this.projections["x"].accessor(d, i, u, m));
          });
        }
      }

      if (attrToSet === "y") {
        if (scale instanceof Scales.Category) {
          this.project("y1", (d: any, i: number, u: any, m: Plots.PlotMetadata) => {
            return scale.scale(this.projections["y"].accessor(d, i, u, m)) - scale.rangeBand() / 2;
          });
          this.project("y2", (d: any, i: number, u: any, m: Plots.PlotMetadata) => {
            return scale.scale(this.projections["y"].accessor(d, i, u, m)) + scale.rangeBand() / 2;
          });
        }
        if (scale instanceof QuantitativeScale) {
          this.project("y1", (d: any, i: number, u: any, m: Plots.PlotMetadata) => {
            return scale.scale(this.projections["y"].accessor(d, i, u, m));
          });
        }
      }

      if (attrToSet === "fill") {
        this.colorScale = this.projections["fill"].scale;
      }

      return this;
    }

    protected generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this.generateAttrToProjector(), animator: this._getAnimator("cells")}];
    }
  }
}
}
