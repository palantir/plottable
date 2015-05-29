///<reference path="../../reference.ts" />

module Plottable {
  export class XYPlot<X, Y> extends Plot {
    protected static _X_KEY = "x";
    protected static _Y_KEY = "y";
    private _adjustYDomainCallback: ScaleCallback<Scale<any, any>>;
    private _adjustXDomainCallback: ScaleCallback<Scale<any, any>>;
    private _adjustingScaleType: string;

    /**
     * An XYPlot is a Plot that displays data along two primary directions, X and Y.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor() {
      super();
      this.classed("xy-plot", true);

      this._adjustYDomainCallback = (scale) => this._adjustYDomain();
      this._adjustXDomainCallback = (scale) => this._adjustXDomain();
    }

    /**
     * Gets the AccessorScaleBinding for X.
     */
    public x(): Plots.AccessorScaleBinding<X, number>;
    /**
     * Sets X to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} x
     * @returns {XYPlot} The calling XYPlot.
     */
    public x(x: number | Accessor<number>): XYPlot<X, Y>;
    /**
     * Sets X to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {X|Accessor<X>} x
     * @param {Scale<X, number>} xScale
     * @returns {XYPlot} The calling XYPlot.
     */
    public x(x: X | Accessor<X>, xScale: Scale<X, number>): XYPlot<X, Y>;
    public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
      if (x == null) {
        return this._propertyBindings.get(XYPlot._X_KEY);
      }
      this._bindProperty(XYPlot._X_KEY, x, xScale);
      if (this._adjustingScaleType === "y") {
        this._updateYExtentsAndAutodomain();
      }

      if (xScale != null) {
        xScale.onUpdate(this._adjustYDomainCallback);
      }

      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for Y.
     */
    public y(): Plots.AccessorScaleBinding<Y, number>;
    /**
     * Sets Y to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} y
     * @returns {XYPlot} The calling XYPlot.
     */
    public y(y: number | Accessor<number>): XYPlot<X, Y>;
    /**
     * Sets Y to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {Y|Accessor<Y>} y
     * @param {Scale<Y, number>} yScale
     * @returns {XYPlot} The calling XYPlot.
     */
    public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): XYPlot<X, Y>;
    public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
      if (y == null) {
        return this._propertyBindings.get(XYPlot._Y_KEY);
      }

      this._bindProperty(XYPlot._Y_KEY, y, yScale);
      if (this._adjustingScaleType === "x") {
        this._updateXExtentsAndAutodomain();
      }

      if (yScale != null) {
        yScale.onUpdate(this._adjustXDomainCallback);
      }

      this.render();
      return this;
    }

    protected _filterForProperty(property: string) {
      if (property === "x" && this._adjustingScaleType === "x") {
        return this._makeFilterByProperty("y");
      } else if (property === "y" && this._adjustingScaleType === "y") {
        return this._makeFilterByProperty("x");
      }
      return null;
    }

    private _makeFilterByProperty(property: string) {
      var binding = this._propertyBindings.get(property);
      if (binding != null) {
        var accessor = binding.accessor;
        var scale = binding.scale;
        if (scale != null) {
          return (datum: any, index: number, dataset: Dataset) => {
            var range = scale.range();
            return Utils.Methods.inRange(scale.scale(accessor(datum, index, dataset)), range[0], range[1]);
          };
        }
      }
      return null;
    }

    protected _uninstallScaleForKey(scale: Scale<any, any>, key: string) {
      super._uninstallScaleForKey(scale, key);
      var adjustCallback = key === XYPlot._X_KEY ? this._adjustYDomainCallback
                                                 : this._adjustXDomainCallback;
      scale.offUpdate(adjustCallback);
    }

    protected _installScaleForKey(scale: Scale<any, any>, key: string) {
      super._installScaleForKey(scale, key);
      var adjustCallback = key === XYPlot._X_KEY ? this._adjustYDomainCallback
                                                 : this._adjustXDomainCallback;
      scale.onUpdate(adjustCallback);
    }

    public destroy() {
      super.destroy();
      if (this.x().scale) {
        this.x().scale.offUpdate(this._adjustYDomainCallback);
      }
      if (this.y().scale) {
        this.y().scale.offUpdate(this._adjustXDomainCallback);
      }
      return this;
    }

    /**
     * Sets the automatic domain adjustment for visible points to operate against the X Scale, Y Scale, or neither.
     * If "x" or "y" is specified the adjustment is immediately performed.
     *
     * @param {string} scaleName One of "x"/"y"/"none".
     *   "x" will adjust the x Scale in relation to changes in the y domain.
     *   "y" will adjust the y Scale in relation to changes in the x domain.
     *   "none" means neither Scale will change automatically.
     *
     * @returns {XYPlot} The calling XYPlot.
     */
    public adjustingScaleType(): string;
    public adjustingScaleType(adjustingScaleType: string): XYPlot<X, Y>;
    public adjustingScaleType(adjustingScaleType?: string): any {
      if (adjustingScaleType == null) {
        return this._adjustingScaleType;
      }
      switch (adjustingScaleType) {
        case "x":
          this._adjustingScaleType = adjustingScaleType;
          this._adjustXDomain();
          break;
        case "y":
          this._adjustingScaleType = adjustingScaleType;
          this._adjustYDomain();
          break;
        case "none":
          this._adjustingScaleType = adjustingScaleType;
          break;
        default:
          throw new Error("Invalid scale name '" + adjustingScaleType + "', must be 'x', 'y' or 'none'");
      }
      return this;
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      var xBinding = this.x();
      var xScale = xBinding && xBinding.scale;
      if (xScale != null) {
        xScale.range([0, this.width()]);
      }
      var yBinding = this.y();
      var yScale = yBinding && yBinding.scale;
      if (yScale != null) {
        if (this.y().scale instanceof Scales.Category) {
          this.y().scale.range([0, this.height()]);
        } else {
          this.y().scale.range([this.height(), 0]);
        }
      }
      return this;
    }

    private _updateXExtentsAndAutodomain() {
      this._updateExtentsForProperty("x");
      var xScale = this.x().scale;
      if (xScale != null) {
        xScale.autoDomain();
      }
    }

    private _updateYExtentsAndAutodomain() {
      this._updateExtentsForProperty("y");
      var yScale = this.y().scale;
      if (yScale != null) {
        yScale.autoDomain();
      }
    }

    /**
     * Adjusts the domains of both X and Y scales to show all data.
     * This call does not override the autorange() behavior.
     * 
     * @returns {XYPlot} The calling XYPlot.
     */
    public showAllData() {
      this._updateXExtentsAndAutodomain();
      this._updateYExtentsAndAutodomain();
      return this;
    }

    private _adjustYDomain() {
      if (!this._projectorsReady()) { return; }
      if (this._adjustingScaleType === "y") {
        this._updateYExtentsAndAutodomain();
      }
    }
    private _adjustXDomain() {
      if (!this._projectorsReady()) { return; }
      if (this._adjustingScaleType === "x") {
        this._updateXExtentsAndAutodomain();
      }
    }

    protected _projectorsReady() {
      var xBinding = this.x();
      var yBinding = this.y();
      return xBinding != null &&
          xBinding.accessor != null &&
          yBinding != null &&
          yBinding.accessor != null;
    }

    protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
      var xProjector = Plot._scaledAccessor(this.x());
      var yProjector = Plot._scaledAccessor(this.y());
      return { x: xProjector(datum, index, dataset), y: yProjector(datum, index, dataset) };
    }

    protected _getDataToDraw() {
      var datasets: D3.Map<any[]> = super._getDataToDraw();

      var definedFunction = (d: any, i: number, dataset: Dataset) => {
        var positionX = Plot._scaledAccessor(this.x())(d, i, dataset);
        var positionY = Plot._scaledAccessor(this.y())(d, i, dataset);
        return Utils.Methods.isValidNumber(positionX) &&
               Utils.Methods.isValidNumber(positionY);
      };

      datasets.forEach((key, data) => {
        var dataset = this._key2PlotDatasetKey.get(key).dataset;
        datasets.set(key, data.filter((d, i) => definedFunction(d, i, dataset)));
      });
      return datasets;
    }
  }
}
