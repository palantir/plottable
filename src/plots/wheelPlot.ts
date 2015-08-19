///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class Wheel<R, T> extends Plot {

    private static _INNER_RADIUS_KEY = "inner-radius";
    private static _OUTER_RADIUS_KEY = "outer-radius";
    private static _START_ANGLE_KEY = "start-angle";
    private static _END_ANGLE_KEY = "end-angle";

    /**
     * @constructor
     */
    constructor() {
      super();
      this.addClass("wheel-plot");
      this.attr("fill", (d, i) => String(i), new Scales.Color());
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
      let radiusLimit = Math.min(this.width(), this.height()) / 2;
      if (this.innerRadius() != null && this.innerRadius().scale != null) {
        this.innerRadius().scale.range([0, radiusLimit]);
      }
      if (this.outerRadius() != null && this.outerRadius().scale != null) {
        this.outerRadius().scale.range([0, radiusLimit]);
      }
      return this;
    }

    protected _createDrawer(dataset: Dataset) {
      return new Plottable.Drawers.Arc(dataset);
    }

    public entities(datasets = this.datasets()): PlotEntity[] {
      let entities = super.entities(datasets);
      entities.forEach((entity) => {
        entity.position.x += this.width() / 2;
        entity.position.y += this.height() / 2;
      });
      return entities;
    }

    protected _getDataToDraw() {
      let dataToDraw = super._getDataToDraw();
      if (this.datasets().length === 0) { return dataToDraw; }
      let startAngleAccessor = Plot._scaledAccessor(this.startAngle());
      let endAngleAccessor = Plot._scaledAccessor(this.endAngle());
      let innerRadiusAccessor = Plot._scaledAccessor(this.innerRadius());
      let outerRadiusAccessor = Plot._scaledAccessor(this.outerRadius());
      let ds = this.datasets()[0];
      let data = dataToDraw.get(ds);
      let filteredData = data.filter((d, i) =>
        Plottable.Utils.Math.isValidNumber(startAngleAccessor(d, i, ds)) &&
        Plottable.Utils.Math.isValidNumber(endAngleAccessor(d, i, ds)) &&
        Plottable.Utils.Math.isValidNumber(innerRadiusAccessor(d, i, ds)) &&
        Plottable.Utils.Math.isValidNumber(outerRadiusAccessor(d, i, ds)));
      dataToDraw.set(ds, filteredData);
      return dataToDraw;
    }

    protected _propertyProjectors(): AttributeToProjector {
      let attrToProjector = super._propertyProjectors();
      let innerRadiusAccessor = Plot._scaledAccessor(this.innerRadius());
      let outerRadiusAccessor = Plot._scaledAccessor(this.outerRadius());
      let startAngleAccessor = Plot._scaledAccessor(this.startAngle());
      let endAngleAccessor = Plot._scaledAccessor(this.endAngle());
      attrToProjector["d"] = (datum: any, index: number, ds: Dataset) => {
        return d3.svg.arc().innerRadius(innerRadiusAccessor(datum, index, ds))
                           .outerRadius(outerRadiusAccessor(datum, index, ds))
                           .startAngle(startAngleAccessor(datum, index, ds))
                           .endAngle(endAngleAccessor(datum, index, ds))(datum, index);
      };
      return attrToProjector;
    }

    /**
     * Gets the AccessorScaleBinding for the start angle.
     */
    public startAngle<T>(): AccessorScaleBinding<T, number>;
    /**
     * Sets the start angle to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} startAngle
     * @returns {Wheel} The calling Wheel Plot.
     */
    public startAngle(startAngle: number | Accessor<number>): Plots.Wheel<R, T>;
    /**
     * Sets the start angle to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {S|Accessor<S>} startAngle
     * @param {Scale<S, number>} scale
     * @returns {Wheel} The calling Wheel Plot.
     */
    public startAngle<T>(startAngle: T | Accessor<T>, scale: Scale<T, number>): Plots.Wheel<R, T>;
    public startAngle<T>(startAngle?: number | Accessor<number> | T | Accessor<T>, scale?: Scale<T, number>): any {
      if (startAngle == null) {
        return this._propertyBindings.get(Wheel._START_ANGLE_KEY);
      }

      if (scale != null) {
        scale.range([0, Math.PI * 2]);
      }

      this._bindProperty(Wheel._START_ANGLE_KEY, startAngle, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for the end angle.
     */
    public endAngle<T>(): AccessorScaleBinding<T, number>;
    /**
     * Sets the end angle to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} endAngle
     * @returns {Wheel} The calling Wheel Plot.
     */
    public endAngle(endAngle: number | Accessor<number>): Plots.Wheel<R, T>;
    /**
     * Sets the end angle to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {S|Accessor<S>} endAngle
     * @param {Scale<S, number>} scale
     * @returns {Wheel} The calling Wheel Plot.
     */
    public endAngle<T>(endAngle: T | Accessor<T>, scale: Scale<T, number>): Plots.Wheel<R, T>;
    public endAngle<T>(endAngle?: number | Accessor<number> | T | Accessor<T>, scale?: Scale<T, number>): any {
      if (endAngle == null) {
        return this._propertyBindings.get(Wheel._END_ANGLE_KEY);
      }

      if (scale != null) {
        scale.range([0, Math.PI * 2]);
      }

      this._bindProperty(Wheel._END_ANGLE_KEY, endAngle, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for the inner radius.
     */
    public innerRadius<R>(): AccessorScaleBinding<R, number>;
    /**
     * Sets the inner radius to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} innerRadius
     * @returns {Wheel} The calling Wheel Plot.
     */
    public innerRadius(innerRadius: number | Accessor<number>): Plots.Wheel<R, T>;
    /**
     * Sets the inner radius to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {R|Accessor<R>} innerRadius
     * @param {Scale<R, number>} scale
     * @returns {Wheel} The calling Wheel Plot.
     */
    public innerRadius<R>(innerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Wheel<R, T>;
    public innerRadius<R>(innerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
      if (innerRadius == null) {
        return this._propertyBindings.get(Wheel._INNER_RADIUS_KEY);
      }
      this._bindProperty(Wheel._INNER_RADIUS_KEY, innerRadius, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for the outer radius.
     */
    public outerRadius<R>(): AccessorScaleBinding<R, number>;
    /**
     * Sets the outer radius to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} outerRadius
     * @returns {Wheel} The calling Wheel Plot.
     */
    public outerRadius(outerRadius: number | Accessor<number>): Plots.Wheel<R, T>;
    /**
     * Sets the outer radius to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {R|Accessor<R>} outerRadius
     * @param {Scale<R, number>} scale
     * @returns {Wheel} The calling Wheel Plot.
     */
    public outerRadius<R>(outerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Wheel<R, T>;
    public outerRadius<R>(outerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
      if (outerRadius == null) {
        return this._propertyBindings.get(Wheel._OUTER_RADIUS_KEY);
      }
      this._bindProperty(Wheel._OUTER_RADIUS_KEY, outerRadius, scale);
      this.render();
      return this;
    }

    protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
      let innerRadius = Plot._scaledAccessor(this.innerRadius())(datum, index, dataset);
      let outerRadius = Plot._scaledAccessor(this.outerRadius())(datum, index, dataset);
      let avgRadius = (innerRadius + outerRadius) / 2;

      let startAngle = Plot._scaledAccessor(this.startAngle())(datum, index, dataset);
      let endAngle = Plot._scaledAccessor(this.endAngle())(datum, index, dataset);
      let avgAngle = (startAngle + endAngle) / 2;
      return { x: avgRadius * Math.sin(avgAngle), y: -avgRadius * Math.cos(avgAngle) };
    }

  }
}
}
