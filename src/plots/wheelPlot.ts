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
        let startAngle = startAngleAccessor(datum, index, ds);
        let endAngle = endAngleAccessor(datum, index, ds);
        if (endAngle < startAngle) {
          endAngle += (Math.floor((startAngle - endAngle) / 360) + 1) * 360;
        }
        return d3.svg.arc().innerRadius(innerRadiusAccessor(datum, index, ds))
                           .outerRadius(outerRadiusAccessor(datum, index, ds))
                           .startAngle(Utils.Math.degreesToRadians(startAngle))
                           .endAngle(Utils.Math.degreesToRadians(endAngle))(datum, index);
      };
      return attrToProjector;
    }

    /**
     * Gets the AccessorScaleBinding for the start angle in degrees.
     */
    public startAngle<T>(): AccessorScaleBinding<T, number>;
    /**
     * Sets the start angle to a constant number or the result of an Accessor<number> in degrees.
     *
     * @param {number|Accessor<number>} startAngle
     * @returns {Wheel} The calling Wheel Plot.
     */
    public startAngle(startAngle: number | Accessor<number>): Plots.Wheel<R, T>;
    /**
     * Sets the start angle to a scaled constant value or scaled result of an Accessor in degrees.
     * The supplied Scale will also be used for endAngle().
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {T|Accessor<T>} startAngle
     * @param {Scale<T, number>} scale
     * @returns {Wheel} The calling Wheel Plot.
     */
    public startAngle<T>(startAngle: T | Accessor<T>, scale: Scale<T, number>): Plots.Wheel<R, T>;
    public startAngle<T>(startAngle?: number | Accessor<number> | T | Accessor<T>, scale?: Scale<T, number>): any {
      if (startAngle == null) {
        return this._propertyBindings.get(Wheel._START_ANGLE_KEY);
      }

      if (scale != null) {
        scale.range([0, 360]);
      }

      let endAngleBinding = this.endAngle();
      let endAngleAccessor = endAngleBinding && endAngleBinding.accessor;
      if (endAngleAccessor != null) {
        this._bindProperty(Wheel._END_ANGLE_KEY, endAngleAccessor, scale);
      }

      this._bindProperty(Wheel._START_ANGLE_KEY, startAngle, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for the end angle in degrees.
     */
    public endAngle<T>(): AccessorScaleBinding<T, number>;
    /**
     * Sets the end angle to a constant number or the result of an Accessor<number> in degrees.
     * If a Scale has been set for startAngle, it will also be used to scale endAngle.
     *
     * @param {number|Accessor<number>} endAngle
     * @returns {Wheel} The calling Wheel Plot.
     */
    public endAngle(endAngle: number | Accessor<number>): Plots.Wheel<R, T>;
    public endAngle<T>(endAngle?: number | Accessor<number> | T | Accessor<T>): any {
      if (endAngle == null) {
        return this._propertyBindings.get(Wheel._END_ANGLE_KEY);
      }

      let startAngleBinding = this.startAngle();
      let angleScale = startAngleBinding && startAngleBinding.scale;
      this._bindProperty(Wheel._END_ANGLE_KEY, endAngle, angleScale);

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
     * The supplied Scale will also be used for outerRadius().
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

      if (scale != null) {
        scale.range([0, 360]);
      }

      let outerRadiusBinding = this.outerRadius();
      let outerRadiusAccessor = outerRadiusBinding && outerRadiusBinding.accessor;
      if (outerRadiusAccessor != null) {
        this._bindProperty(Wheel._OUTER_RADIUS_KEY, outerRadiusAccessor, scale);
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
     * If a Scale has been set for innerRadius, it will also be used to scale outerRadius.
     *
     * @param {number|Accessor<number>} outerRadius
     * @returns {Wheel} The calling Wheel Plot.
     */
    public outerRadius(outerRadius: number | Accessor<number>): Plots.Wheel<R, T>;
    public outerRadius<R>(outerRadius?: number | Accessor<number> | R | Accessor<R>): any {
      if (outerRadius == null) {
        return this._propertyBindings.get(Wheel._OUTER_RADIUS_KEY);
      }

      let innerRadiusBinding = this.innerRadius();
      let radiusScale = innerRadiusBinding && innerRadiusBinding.scale;
      this._bindProperty(Wheel._OUTER_RADIUS_KEY, outerRadius, radiusScale);
      this.render();
      return this;
    }

    protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
      let innerRadius = Plot._scaledAccessor(this.innerRadius())(datum, index, dataset);
      let outerRadius = Plot._scaledAccessor(this.outerRadius())(datum, index, dataset);
      let avgRadius = (innerRadius + outerRadius) / 2;

      let startAngle = Plot._scaledAccessor(this.startAngle())(datum, index, dataset);
      let endAngle = Plot._scaledAccessor(this.endAngle())(datum, index, dataset);
      let avgAngle = Utils.Math.degreesToRadians((startAngle + endAngle) / 2);
      return { x: avgRadius * Math.sin(avgAngle), y: -avgRadius * Math.cos(avgAngle) };
    }

  }
}
}
