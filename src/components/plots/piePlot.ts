///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  /*
   * A PiePlot is a plot meant to show how much out of a total an attribute's value is.
   * One usecase is to show how much funding departments are given out of a total budget.
   */
  export class Pie extends Plot {

    private static _INNER_RADIUS_KEY = "inner-radius";
    private static _OUTER_RADIUS_KEY = "outer-radius";
    private static _SECTOR_VALUE_KEY = "sector-value";

    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      super();
      this.innerRadius(0);
      this.outerRadius(() => Math.min(this.width(), this.height()) / 2);
      this.classed("pie-plot", true);
      this.attr("fill", (d, i) => String(i), new Scales.Color());
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
      var radiusLimit = Math.min(this.width(), this.height()) / 2;
      if (this.innerRadius().scale != null) {
        this.innerRadius().scale.range([0, radiusLimit]);
      }
      if (this.outerRadius().scale != null) {
        this.outerRadius().scale.range([0, radiusLimit]);
      }
      return this;
    }

    public addDataset(dataset: Dataset) {
      if (this._datasetKeysInOrder.length === 1) {
        Utils.Methods.warn("Only one dataset is supported in Pie plots");
        return this;
      }
      super.addDataset(dataset);
      return this;
    }

    protected _getDrawer(key: string) {
      return new Plottable.Drawers.Arc(key).setClass("arc");
    }

    public getAllPlotData(datasets = this.datasets()): Plots.PlotData {
      var allPlotData = super.getAllPlotData(datasets);

      allPlotData.pixelPoints.forEach((pixelPoint: Point) => {
        pixelPoint.x = pixelPoint.x + this.width() / 2;
        pixelPoint.y = pixelPoint.y + this.height() / 2;
      });

      return allPlotData;
    }

    public sectorValue<S>(): AccessorScaleBinding<S, number>;
    public sectorValue(sectorValue: number | Accessor<number>): Plots.Pie;
    public sectorValue<S>(sectorValue: S | Accessor<S>, scale: Scale<S, number>): Plots.Pie;
    public sectorValue<S>(sectorValue?: number | Accessor<number> | S | Accessor<S>, scale?: Scale<S, number>): any {
      if (sectorValue == null) {
        return this._propertyBindings.get(Pie._SECTOR_VALUE_KEY);
      }
      this._bindProperty(Pie._SECTOR_VALUE_KEY, sectorValue, scale);
      this.renderImmediately();
      return this;
    }

    public innerRadius<R>(): AccessorScaleBinding<R, number>;
    public innerRadius(innerRadius: number | Accessor<number>): Plots.Pie;
    public innerRadius<R>(innerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Pie;
    public innerRadius<R>(innerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
      if (innerRadius == null) {
        return this._propertyBindings.get(Pie._INNER_RADIUS_KEY);
      }
      this._bindProperty(Pie._INNER_RADIUS_KEY, innerRadius, scale);
      this.renderImmediately();
      return this;
    }

    public outerRadius<R>(): AccessorScaleBinding<R, number>;
    public outerRadius(outerRadius: number | Accessor<number>): Plots.Pie;
    public outerRadius<R>(outerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Pie;
    public outerRadius<R>(outerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
      if (outerRadius == null) {
        return this._propertyBindings.get(Pie._OUTER_RADIUS_KEY);
      }
      this._bindProperty(Pie._OUTER_RADIUS_KEY, outerRadius, scale);
      this.renderImmediately();
      return this;
    }
  }
}
}
