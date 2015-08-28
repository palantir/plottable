///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class Wheel<R, T> extends Plot {

    private static _R1_KEY = "r1";
    private static _R2_KEY = "r2";
    private static _T1_KEY = "t1";
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
      if (this.r1() != null && this.r1().scale != null) {
        this.r1().scale.range([0, radiusLimit]);
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
      let t1Accessor = Plot._scaledAccessor(this.t1());
      let t2Accessor = Plot._scaledAccessor(this.t2());
      let r1Accessor = Plot._scaledAccessor(this.r1());
      let r2Accessor = Plot._scaledAccessor(this.r2());
      let ds = this.datasets()[0];
      let data = dataToDraw.get(ds);
      let filteredData = data.filter((d, i) =>
        Plottable.Utils.Math.isValidNumber(t1Accessor(d, i, ds)) &&
        Plottable.Utils.Math.isValidNumber(t2Accessor(d, i, ds)) &&
        Plottable.Utils.Math.isValidNumber(r1Accessor(d, i, ds)) &&
        Plottable.Utils.Math.isValidNumber(r2Accessor(d, i, ds)));
      dataToDraw.set(ds, filteredData);
      return dataToDraw;
    }

    protected _propertyProjectors(): AttributeToProjector {
      let attrToProjector = super._propertyProjectors();
      let r1Accessor = Plot._scaledAccessor(this.r1());
      let r2Accessor = Plot._scaledAccessor(this.r2());
      let t1Accessor = Plot._scaledAccessor(this.t1());
      let t2Accessor = Plot._scaledAccessor(this.t2());
      attrToProjector["d"] = (datum: any, index: number, ds: Dataset) => {
        let t1 = t1Accessor(datum, index, ds);
        let t2 = t2Accessor(datum, index, ds);
        if (t2 < t1) {
          t2 += (Math.floor((t1 - t2) / 360) + 1) * 360;
        }
        return d3.svg.arc().innerRadius(r1Accessor(datum, index, ds))
                           .outerRadius(r2Accessor(datum, index, ds))
                           .startAngle(Utils.Math.degreesToRadians(t1))
                           .endAngle(Utils.Math.degreesToRadians(t2))(datum, index);
      };
      return attrToProjector;
    }

    /**
     * Gets the AccessorScaleBinding for t1 in degrees.
     */
    public t1<T>(): AccessorScaleBinding<T, number>;
    /**
     * Sets t1 to a constant number or the result of an Accessor<number> in degrees.
     *
     * @param {number|Accessor<number>} t1
     * @returns {Wheel} The calling Wheel Plot.
     */
    public t1(t1: number | Accessor<number>): Plots.Wheel<R, T>;
    /**
     * Sets t1 to a scaled constant value or scaled result of an Accessor in degrees.
     * The supplied Scale will also be used for t2().
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {T|Accessor<T>} t1
     * @param {QuantitativeScale<T>} scale
     * @returns {Wheel} The calling Wheel Plot.
     */
    public t1<T>(t1: T | Accessor<T>, scale: QuantitativeScale<T>): Plots.Wheel<R, T>;
    public t1<T>(t1?: number | Accessor<number> | T | Accessor<T>, scale?: QuantitativeScale<T>): any {
      if (t1 == null) {
        return this._propertyBindings.get(Wheel._T1_KEY);
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

      this._bindProperty(Wheel._T1_KEY, t1, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for t2 in degrees.
     */
    public t2<T>(): AccessorScaleBinding<T, number>;
    /**
     * Sets t2 to a constant number or the result of an Accessor<number> in degrees.
     * If a Scale has been set for t1, it will also be used to scale t2.
     *
     * @param {number|Accessor<number>} t2
     * @returns {Wheel} The calling Wheel Plot.
     */
    public t2(t2: number | Accessor<number>): Plots.Wheel<R, T>;
    public t2<T>(t2?: number | Accessor<number> | T | Accessor<T>): any {
      if (t2 == null) {
        return this._propertyBindings.get(Wheel._T2_KEY);
      }

      let t1Binding = this.t1();
      let angleScale = t1Binding && t1Binding.scale;
      this._bindProperty(Wheel._T2_KEY, t2, angleScale);

      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for r1.
     */
    public r1<R>(): AccessorScaleBinding<R, number>;
    /**
     * Sets r1 to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} r1
     * @returns {Wheel} The calling Wheel Plot.
     */
    public r1(r1: number | Accessor<number>): Plots.Wheel<R, T>;
    /**
     * Sets r1 to a scaled constant value or scaled result of an Accessor.
     * The supplied Scale will also be used for r2().
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {R|Accessor<R>} r1
     * @param {QuantitativeScale<R>} scale
     * @returns {Wheel} The calling Wheel Plot.
     */
    public r1<R>(r1: R | Accessor<R>, scale: QuantitativeScale<R>): Plots.Wheel<R, T>;
    public r1<R>(r1?: number | Accessor<number> | R | Accessor<R>, scale?: QuantitativeScale<R>): any {
      if (r1 == null) {
        return this._propertyBindings.get(Wheel._R1_KEY);
      }

      if (scale != null && !QuantitativeScale.prototype.isPrototypeOf(scale)) {
        throw new Error("scale needs to inherit from Scale.QuantitativeScale");
      }

      let r2Binding = this.r2();
      let r2Accessor = r2Binding && r2Binding.accessor;
      if (r2Accessor != null) {
        this._bindProperty(Wheel._R2_KEY, r2Accessor, scale);
      }

      this._bindProperty(Wheel._R1_KEY, r1, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for r2.
     */
    public r2<R>(): AccessorScaleBinding<R, number>;
    /**
     * Sets r2 to a constant number or the result of an Accessor<number>.
     * If a Scale has been set for r1, it will also be used to scale r2.
     *
     * @param {number|Accessor<number>} r2
     * @returns {Wheel} The calling Wheel Plot.
     */
    public r2(r2: number | Accessor<number>): Plots.Wheel<R, T>;
    public r2<R>(r2?: number | Accessor<number> | R | Accessor<R>): any {
      if (r2 == null) {
        return this._propertyBindings.get(Wheel._R2_KEY);
      }

      let r1Binding = this.r1();
      let radiusScale = r1Binding && r1Binding.scale;
      this._bindProperty(Wheel._R2_KEY, r2, radiusScale);
      this.render();
      return this;
    }

    protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
      let r1 = Plot._scaledAccessor(this.r1())(datum, index, dataset);
      let r2 = Plot._scaledAccessor(this.r2())(datum, index, dataset);
      let avgRadius = (r1 + r2) / 2;

      let t1 = Plot._scaledAccessor(this.t1())(datum, index, dataset);
      let t2 = Plot._scaledAccessor(this.t2())(datum, index, dataset);
      let avgAngle = Utils.Math.degreesToRadians((t1 + t2) / 2);
      return { x: avgRadius * Math.sin(avgAngle), y: -avgRadius * Math.cos(avgAngle) };
    }

  }
}
}
