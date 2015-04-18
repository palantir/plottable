///<reference path="../../reference.ts" />

module Plottable {
  export module Plot {
    export class Waterfall extends Rectangle<any, any> {
      private _colorScale: Scale.AbstractScale<any, string>;

      /**
       * Constructs a WaterfallPlot.
       *
       * A WaterfallPlot is used to display the deltas between certain bar values that are marked as base values.
       *
       * @constructor
       * @param {Scale.AbstractScale} xScale The x scale to use.
       * @param {Scale.AbstractQuantitative} yScale The y scale to use.
       * @param {Scale.Color|Scale.InterpolatedColor} colorScale The color scale
       * to use for each grid cell.
       */
      constructor(xScale: Scale.AbstractScale<any, any>, yScale: Scale.AbstractQuantitative<any>,
        colorScale: Scale.AbstractScale<any, string>) {
        super(xScale, yScale);
        this.classed("waterfall-plot", true);

        this._colorScale = colorScale;
        this.animator("cells", new Animator.Null());
      }

      public addDataset(keyOrDataset: any, dataset?: any) {
        if (this._datasetKeysInOrder.length === 1) {
          _Util.Methods.warn("Only one dataset is supported in Waterfall plots");
          return this;
        }
        super.addDataset(keyOrDataset, dataset);
        return this;
      }

      protected _getDrawer(key: string) {
        return new _Drawer.Rect(key, true);
      }

      /**
       * @param {string} attrToSet One of ["x", "y", "x2", "y2", "fill"]. If "fill" is used,
       * the data should return a valid CSS color.
       */
      public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
        super.project(attrToSet, accessor, scale);

        if (attrToSet === "x") {
          if (scale instanceof Scale.Category) {
            this.project("x1", (d: any, i: number, u: any, m: Plot.PlotMetadata) => {
              return scale.scale(this._projections["x"].accessor(d, i, u, m)) - scale.rangeBand() / 2;
            });
            this.project("x2", (d: any, i: number, u: any, m: Plot.PlotMetadata) => {
              return scale.scale(this._projections["x"].accessor(d, i, u, m)) + scale.rangeBand() / 2;
            });
          }
          if (scale instanceof Scale.AbstractQuantitative) {
            this.project("x1", (d: any, i: number, u: any, m: Plot.PlotMetadata) => {
              return scale.scale(this._projections["x"].accessor(d, i, u, m));
            });
          }
        }

        if (attrToSet === "y") {
          if (scale instanceof Scale.AbstractQuantitative) {
            this.project("y1", (d: any, i: number, u: any, m: Plot.PlotMetadata) => {
              var data = this.datasets()[0].data();
              if (i == 0 || data[i].y == data[i-1].y) {
                return scale.scale(scale.domain()[0]);
              }
              if (data[i].y > data[i-1].y) {
                return scale.scale(this._projections["y"].accessor(d, i, u, m));
              } else {
                return scale.scale(data[i-1].y);
              }
            });
            this.project("y2", (d: any, i: number, u: any, m: Plot.PlotMetadata) => {
              var data = this.datasets()[0].data();
              if (i == 0 || data[i].y == data[i - 1].y) {
                return scale.scale(this._projections["y"].accessor(d, i, u, m));
              }
              if (data[i].y > data[i - 1].y) {
                return scale.scale(data[i-1].y);
              } else {
                return scale.scale(this._projections["y"].accessor(d, i, u, m));
              }
            });
            this.project("class", (d: any, i: number, u: any, m: Plot.PlotMetadata) => {
              var data = this.datasets()[0].data();
              if (i == 0 || data[i].y == data[i - 1].y) {
                return "waterfall-base";
              }
              if (data[i].y > data[i - 1].y) {
                return "waterfall-growth";
              } else {
                return "waterfall-decline";
              }
            });
          }
        }

        if (attrToSet === "fill") {
          this._colorScale = this._projections["fill"].scale;
        }

        return this;
      }

      protected _generateDrawSteps(): _Drawer.DrawStep[] {
        return [{ attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("cells") }];
      }
    }
  }
}
