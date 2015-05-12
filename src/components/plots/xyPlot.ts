///<reference path="../../reference.ts" />

module Plottable {
  export class XYPlot<X, Y> extends Plot {
    protected _xScale: Scale<X, number>;
    protected _yScale: Scale<Y, number>;
    private _autoAdjustXScaleDomain = false;
    private _autoAdjustYScaleDomain = false;
    private _adjustYDomainOnChangeFromXCallback: ScaleCallback<Scale<any, any>>;
    private _adjustXDomainOnChangeFromYCallback: ScaleCallback<Scale<any, any>>;

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

      this._xScale = xScale;
      this._yScale = yScale;

      this._adjustYDomainOnChangeFromXCallback = (scale) => this._adjustYDomainOnChangeFromX();
      this._adjustXDomainOnChangeFromYCallback = (scale) => this._adjustXDomainOnChangeFromY();

      this._updateXDomainer();
      xScale.onUpdate(this._adjustYDomainOnChangeFromXCallback);

      this._updateYDomainer();
      yScale.onUpdate(this._adjustXDomainOnChangeFromYCallback);
    }

    /**
     * @param {string} attrToSet One of ["x", "y"] which determines the point's
     * x and y position in the Plot.
     */
    public project(attrToSet: string, accessor: any, scale?: Scale<any, any>) {
      // We only want padding and nice-ing on scales that will correspond to axes / pixel layout.
      // So when we get an "x" or "y" scale, enable autoNiceing and autoPadding.
      if (attrToSet === "x" && scale) {
        if (this._xScale) {
          this._xScale.offUpdate(this._adjustYDomainOnChangeFromXCallback);
        }
        this._xScale = scale;
        this._updateXDomainer();

        scale.onUpdate(this._adjustYDomainOnChangeFromXCallback);
      }

      if (attrToSet === "y" && scale) {
        if (this._yScale) {
          this._yScale.offUpdate(this._adjustXDomainOnChangeFromYCallback);
        }
        this._yScale = scale;
        this._updateYDomainer();
        scale.onUpdate(this._adjustXDomainOnChangeFromYCallback);
      }

      super.project(attrToSet, accessor, scale);

      return this;
    }

    public destroy() {
      super.destroy();
      if (this._xScale) {
        this._xScale.offUpdate(this._adjustYDomainOnChangeFromXCallback);
      }
      if (this._yScale) {
        this._yScale.offUpdate(this._adjustXDomainOnChangeFromYCallback);
      }
      return this;
    }

    /**
     * Sets the automatic domain adjustment over visible points for y scale.
     *
     * If autoAdjustment is true adjustment is immediately performend.
     *
     * @param {boolean} autoAdjustment The new value for the automatic adjustment domain for y scale.
     * @returns {XYPlot} The calling XYPlot.
     */
    public automaticallyAdjustYScaleOverVisiblePoints(autoAdjustment: boolean): XYPlot<X, Y> {
      this._autoAdjustYScaleDomain = autoAdjustment;

      if (this._autoAdjustYScaleDomain) {
        this._attrFilters.set("y", this._makeFilterByAttr("x"));
      } else {
        this._attrFilters.set("y", null);
      }

      this._adjustYDomainOnChangeFromX();
      return this;
    }

    /**
     * Sets the automatic domain adjustment over visible points for x scale.
     *
     * If autoAdjustment is true adjustment is immediately performend.
     *
     * @param {boolean} autoAdjustment The new value for the automatic adjustment domain for x scale.
     * @returns {XYPlot} The calling XYPlot.
     */
    public automaticallyAdjustXScaleOverVisiblePoints(autoAdjustment: boolean): XYPlot<X, Y>  {
      this._autoAdjustXScaleDomain = autoAdjustment;

      if (this._autoAdjustXScaleDomain) {
        this._attrFilters.set("x", this._makeFilterByAttr("y"));
      } else {
        this._attrFilters.set("x", null);
      }

      this._adjustXDomainOnChangeFromY();
      return this;
    }

    protected _generateAttrToProjector(): AttributeToProjector {
      var attrToProjector: AttributeToProjector = super._generateAttrToProjector();
      var positionXFn = attrToProjector["x"];
      var positionYFn = attrToProjector["y"];
      attrToProjector["defined"] = (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => {
        var positionX = positionXFn(d, i, dataset, m);
        var positionY = positionYFn(d, i, dataset, m);
        return positionX != null && positionX === positionX &&
               positionY != null && positionY === positionY;
      };
      return attrToProjector;
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._xScale.range([0, this.width()]);
      if (this._yScale instanceof Scales.Category) {
        this._yScale.range([0, this.height()]);
      } else {
        this._yScale.range([this.height(), 0]);
      }
      return this;
    }

    protected _updateXDomainer() {
      if (this._xScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale<any>> this._xScale;
        if (!scale._userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }

    protected _updateYDomainer() {
      if (this._yScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale<any>> this._yScale;
        if (!scale._userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }

    /**
     * Adjusts both domains' extents to show all datasets.
     *
     * This call does not override auto domain adjustment behavior over visible points.
     */
    public showAllData() {
      this._updateExtentsForAttr("x");
      this._xScale.autoDomain();
      this._updateExtentsForAttr("y");
      this._yScale.autoDomain();
      return this;
    }

    private _adjustYDomainOnChangeFromX() {
      if (!this._projectorsReady()) { return; }
      if (this._autoAdjustYScaleDomain) {
        this._updateExtentsForAttr("y");
        this._yScale.autoDomain();
      }
    }
    private _adjustXDomainOnChangeFromY() {
      if (!this._projectorsReady()) { return; }
      if (this._autoAdjustXScaleDomain) {
        this._updateExtentsForAttr("x");
        this._xScale.autoDomain();
      }
    }

    protected _projectorsReady() {
      return this._attrBindings.get("x") && this._attrBindings.get("y");
    }
  }
}
