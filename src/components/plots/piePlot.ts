///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Pie extends Plot {

    private static _INNER_RADIUS_KEY = "inner-radius";
    private static _OUTER_RADIUS_KEY = "outer-radius";
    private static _SECTOR_VALUE_KEY = "sector-value";

    /**
     * Constructs a Pie Plot.
     * Pie Plots only support a single Dataset.
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

    /**
     * Gets the AccessorScaleBinding for the sector value.
     */
    public sectorValue<S>(): AccessorScaleBinding<S, number>;
    /**
     * Sets the sector value to a constant number, or to the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} sectorValue
     * @returns {Pie} The calling Pie Plot.
     */
    public sectorValue(sectorValue: number | Accessor<number>): Plots.Pie;
    /**
     * Sets the sector value to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {S|Accessor<S>} sectorValue
     * @param {Scale<S, number>} scale
     * @returns {Pie} The calling Pie Plot.
     */
    public sectorValue<S>(sectorValue: S | Accessor<S>, scale: Scale<S, number>): Plots.Pie;
    public sectorValue<S>(sectorValue?: number | Accessor<number> | S | Accessor<S>, scale?: Scale<S, number>): any {
      if (sectorValue == null) {
        return this._propertyBindings.get(Pie._SECTOR_VALUE_KEY);
      }
      this._bindProperty(Pie._SECTOR_VALUE_KEY, sectorValue, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for the inner radius.
     */
    public innerRadius<R>(): AccessorScaleBinding<R, number>;
    /**
     * Sets the inner radius to a constant number, or to the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} innerRadius
     * @returns {Pie} The calling Pie Plot.
     */
    public innerRadius(innerRadius: number | Accessor<number>): Plots.Pie;
    /**
     * Sets the inner radius to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {R|Accessor<R>} innerRadius
     * @param {Scale<R, number>} scale
     * @returns {Pie} The calling Pie Plot.
     */
    public innerRadius<R>(innerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Pie;
    public innerRadius<R>(innerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
      if (innerRadius == null) {
        return this._propertyBindings.get(Pie._INNER_RADIUS_KEY);
      }
      this._bindProperty(Pie._INNER_RADIUS_KEY, innerRadius, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for the outer radius.
     */
    public outerRadius<R>(): AccessorScaleBinding<R, number>;
    /**
     * Sets the outer radius to a constant number, or to the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} outerRadius
     * @returns {Pie} The calling Pie Plot.
     */
    public outerRadius(outerRadius: number | Accessor<number>): Plots.Pie;
    /**
     * Sets the outer radius to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {R|Accessor<R>} outerRadius
     * @param {Scale<R, number>} scale
     * @returns {Pie} The calling Pie Plot.
     */
    public outerRadius<R>(outerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Pie;
    public outerRadius<R>(outerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
      if (outerRadius == null) {
        return this._propertyBindings.get(Pie._OUTER_RADIUS_KEY);
      }
      this._bindProperty(Pie._OUTER_RADIUS_KEY, outerRadius, scale);
      this.render();
      return this;
    }
  }
}
}
