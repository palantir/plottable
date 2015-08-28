///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class Wheel<R, T> extends Plot {

    private static _R_KEY = "r";
    private static _R2_KEY = "r2";
    private static _T_KEY = "t";
    private static _T2_KEY = "t2";

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
      if (this.r() != null && this.r().scale != null) {
        this.r().scale.range([0, radiusLimit]);
      }
      if (this.r2() != null && this.r2().scale != null) {
        this.r2().scale.range([0, radiusLimit]);
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
      let tAccessor = Plot._scaledAccessor(this.t());
      let t2Accessor = Plot._scaledAccessor(this.t2());
      let rAccessor = Plot._scaledAccessor(this.r());
      let r2Accessor = Plot._scaledAccessor(this.r2());
      let ds = this.datasets()[0];
      let data = dataToDraw.get(ds);
      let filteredData = data.filter((d, i) =>
        Plottable.Utils.Math.isValidNumber(tAccessor(d, i, ds)) &&
        Plottable.Utils.Math.isValidNumber(t2Accessor(d, i, ds)) &&
        Plottable.Utils.Math.isValidNumber(rAccessor(d, i, ds)) &&
        Plottable.Utils.Math.isValidNumber(r2Accessor(d, i, ds)) &&
        rAccessor(d, i, ds) >= 0 && r2Accessor(d, i, ds) >= 0);
      dataToDraw.set(ds, filteredData);
      return dataToDraw;
    }

    protected _propertyProjectors(): AttributeToProjector {
      let attrToProjector = super._propertyProjectors();
      let rAccessor = Plot._scaledAccessor(this.r());
      let r2Accessor = Plot._scaledAccessor(this.r2());
      let tAccessor = Plot._scaledAccessor(this.t());
      let t2Accessor = Plot._scaledAccessor(this.t2());
      attrToProjector["d"] = (datum: any, index: number, ds: Dataset) => {
        let t = tAccessor(datum, index, ds);
        let t2 = t2Accessor(datum, index, ds);
        if (t2 < t) {
          t2 += (Math.floor((t - t2) / 360) + 1) * 360;
        }
        return d3.svg.arc().innerRadius(rAccessor(datum, index, ds))
                           .outerRadius(r2Accessor(datum, index, ds))
                           .startAngle(Utils.Math.degreesToRadians(t))
                           .endAngle(Utils.Math.degreesToRadians(t2))(datum, index);
      };
      return attrToProjector;
    }

    /**
     * Gets the AccessorScaleBinding for t in degrees.
     */
    public t(): AccessorScaleBinding<T, number>;
    /**
     * Sets t to a constant number or the result of an Accessor<number> in degrees.
     *
     * @param {number|Accessor<number>} t
     * @returns {Wheel} The calling Wheel Plot.
     */
    public t(t: number | Accessor<number>): Plots.Wheel<R, T>;
    /**
     * Sets t to a scaled constant value or scaled result of an Accessor in degrees.
     * The supplied Scale will also be used for t2().
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {T|Accessor<T>} t
     * @param {QuantitativeScale<T>} scale
     * @returns {Wheel} The calling Wheel Plot.
     */
    public t(t: T | Accessor<T>, scale: QuantitativeScale<T>): Plots.Wheel<R, T>;
    public t(t?: number | Accessor<number> | T | Accessor<T>, scale?: QuantitativeScale<T>): any {
      if (t == null) {
        return this._propertyBindings.get(Wheel._T_KEY);
      }

      if (scale != null) {
        if (!QuantitativeScale.prototype.isPrototypeOf(scale)) {
          throw new Error("scale needs to inherit from Scale.QuantitativeScale");
        }
        scale.range([0, 360]);
        scale.padProportion(0);
      }

      let t2Binding = this.t2();
      let t2Accessor = t2Binding && t2Binding.accessor;
      if (t2Accessor != null) {
        this._bindProperty(Wheel._T2_KEY, t2Accessor, scale);
      }

      this._bindProperty(Wheel._T_KEY, t, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for t2 in degrees.
     */
    public t2(): AccessorScaleBinding<T, number>;
    /**
     * Sets t2 to a constant number or the result of an Accessor<number> in degrees.
     * If a Scale has been set for t, it will also be used to scale t2.
     *
     * @param {number|Accessor<number|T|Accessor<T>>} t2
     * @returns {Wheel} The calling Wheel Plot.
     */
    public t2(t2: number | Accessor<number> | T | Accessor<T>): Plots.Wheel<R, T>;
    public t2(t2?: number | Accessor<number> | T | Accessor<T>): any {
      if (t2 == null) {
        return this._propertyBindings.get(Wheel._T2_KEY);
      }

      let tBinding = this.t();
      let angleScale = tBinding && tBinding.scale;
      this._bindProperty(Wheel._T2_KEY, t2, angleScale);

      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for r.
     */
    public r(): AccessorScaleBinding<R, number>;
    /**
     * Sets r to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} r
     * @returns {Wheel} The calling Wheel Plot.
     */
    public r(r: number | Accessor<number>): Plots.Wheel<R, T>;
    /**
     * Sets r to a scaled constant value or scaled result of an Accessor.
     * The supplied Scale will also be used for r2().
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {R|Accessor<R>} r
     * @param {QuantitativeScale<R>} scale
     * @returns {Wheel} The calling Wheel Plot.
     */
    public r(r: R | Accessor<R>, scale: QuantitativeScale<R>): Plots.Wheel<R, T>;
    public r(r?: number | Accessor<number> | R | Accessor<R>, scale?: QuantitativeScale<R>): any {
      if (r == null) {
        return this._propertyBindings.get(Wheel._R_KEY);
      }

      if (scale != null && !QuantitativeScale.prototype.isPrototypeOf(scale)) {
        throw new Error("scale needs to inherit from Scale.QuantitativeScale");
      }

      let r2Binding = this.r2();
      let r2Accessor = r2Binding && r2Binding.accessor;
      if (r2Accessor != null) {
        this._bindProperty(Wheel._R2_KEY, r2Accessor, scale);
      }

      this._bindProperty(Wheel._R_KEY, r, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for r2.
     */
    public r2(): AccessorScaleBinding<R, number>;
    /**
     * Sets r2 to a constant number or the result of an Accessor<number>.
     * If a Scale has been set for r, it will also be used to scale r2.
     *
     * @param {number|Accessor<number>|R|Accessor<R>} r2
     * @returns {Wheel} The calling Wheel Plot.
     */
    public r2(r2: number | Accessor<number> | R | Accessor<R>): Plots.Wheel<R, T>;
    public r2(r2?: number | Accessor<number> | R | Accessor<R>): any {
      if (r2 == null) {
        return this._propertyBindings.get(Wheel._R2_KEY);
      }

      let rBinding = this.r();
      let radiusScale = rBinding && rBinding.scale;
      this._bindProperty(Wheel._R2_KEY, r2, radiusScale);
      this.render();
      return this;
    }

    protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
      let r = Plot._scaledAccessor(this.r())(datum, index, dataset);
      let r2 = Plot._scaledAccessor(this.r2())(datum, index, dataset);
      let avgRadius = r >= 0 && r2 >= 0 ? (r + r2) / 2 : NaN;

      let t = Plot._scaledAccessor(this.t())(datum, index, dataset);
      let t2 = Plot._scaledAccessor(this.t2())(datum, index, dataset);
      let avgAngle = Utils.Math.degreesToRadians((t + t2) / 2);
      return { x: avgRadius * Math.sin(avgAngle), y: -avgRadius * Math.cos(avgAngle) };
    }

  }
}
}
