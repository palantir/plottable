///<reference path="../../reference.ts" />

module Plottable {
  export class XYPlot<X, Y> extends Plot {
    protected static _X_KEY = "x";
    protected static _Y_KEY = "y";
    private _adjustYDomainCallback: ScaleCallback<Scale<any, any>>;
    private _adjustXDomainCallback: ScaleCallback<Scale<any, any>>;
    private _adjustingDomain: string;

    /**
     * Constructs an XYPlot.
     *
     * An XYPlot is a plot from drawing 2-dimensional data. Common examples
     * include Scale.Line and Scale.Bar.
     *
     * @constructor
     * @param {any[]|Dataset} [dataset] The data or Dataset to be associated with this Renderer.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>) {
      super();
      if (xScale == null || yScale == null) {
        throw new Error("XYPlots require an xScale and yScale");
      }
      this.classed("xy-plot", true);

      this._propertyBindings.set(XYPlot._X_KEY, { accessor: null, scale: xScale });
      this._propertyBindings.set(XYPlot._Y_KEY, { accessor: null, scale: yScale });

      this._adjustYDomainCallback = (scale) => this._adjustYDomain();
      this._adjustXDomainCallback = (scale) => this._adjustXDomain();

      xScale.onUpdate(this._adjustYDomainCallback);
      yScale.onUpdate(this._adjustXDomainCallback);

      this._adjustingDomain = "none";
    }

    public x(): Plots.AccessorScaleBinding<X, number>;
    public x(x: number | Accessor<number>): XYPlot<X, Y>;
    public x(x: X | Accessor<X>, xScale: Scale<X, number>): XYPlot<X, Y>;
    public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
      if (x == null) {
        return this._propertyBindings.get(XYPlot._X_KEY);
      }
      this._bindProperty(XYPlot._X_KEY, x, xScale);
      if (this._adjustingDomain === "y") {
        this._updateYExtentsAndAutodomain();
      }
      this.render();
      return this;
    }

    public y(): Plots.AccessorScaleBinding<Y, number>;
    public y(y: number | Accessor<number>): XYPlot<X, Y>;
    public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): XYPlot<X, Y>;
    public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
      if (y == null) {
        return this._propertyBindings.get(XYPlot._Y_KEY);
      }

      this._bindProperty(XYPlot._Y_KEY, y, yScale);
      if (this._adjustingDomain === "x") {
        this._updateXExtentsAndAutodomain();
      }
      this.render();
      return this;
    }

    protected _filterForProperty(property: string) {
      if (property === "x" && this._adjustingDomain === "x") {
        return this._makeFilterByProperty("y");
      } else if (property === "y" && this._adjustingDomain === "y") {
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
     * Sets the automatic domain adjustment for visible points to operate against the X scale, Y scale, or neither.  
     * 
     * If 'x' or 'y' is specified the adjustment is immediately performed.
     * 
     * @param {string} scale Must be one of 'x', 'y', or 'none'.  
     * 
     * 'x' will adjust the x scale in relation to changes in the y domain.  
     * 
     * 'y' will adjust the y scale in relation to changes in the x domain.
     * 
     * 'none' means neither scale will change automatically.
     * 
     * @returns {XYPlot} The calling XYPlot.
     */
    public autorange(scaleName: string) {
      switch (scaleName) {
        case "x":
          this._adjustingDomain = scaleName;
          this._adjustXDomain();
          break;
        case "y":
          this._adjustingDomain = scaleName;
          this._adjustYDomain();
          break;
        case "none":
          this._adjustingDomain = scaleName;
          break;
        default:
          throw new Error("Invalid scale name '" + scaleName + "', must be 'x', 'y' or 'none'");
      }
      return this;
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      var xScale = this.x().scale;
      if (xScale != null) {
        xScale.range([0, this.width()]);
      }
      var yScale = this.y().scale;
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
     * Adjusts both domains' extents to show all datasets.
     *
     * This call does not override auto domain adjustment behavior over visible points.
     */
    public showAllData() {
      this._updateXExtentsAndAutodomain();
      this._updateYExtentsAndAutodomain();
      return this;
    }

    private _adjustYDomain() {
      if (!this._projectorsReady()) { return; }
      if (this._adjustingDomain === "y") {
        this._updateYExtentsAndAutodomain();
      }
    }
    private _adjustXDomain() {
      if (!this._projectorsReady()) { return; }
      if (this._adjustingDomain === "x") {
        this._updateXExtentsAndAutodomain();
      }
    }

    protected _projectorsReady() {
      return this.x().accessor != null && this.y().accessor != null;
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
