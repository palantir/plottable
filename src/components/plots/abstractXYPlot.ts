///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class AbstractXYPlot<X,Y> extends AbstractPlot {
    public _xScale: Scale.AbstractScale<X, number>;
    public _yScale: Scale.AbstractScale<Y, number>;
    public _autoDomainXScale = false;
    public _autoDomainYScale = false;

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
    constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>) {
      super();
      if (xScale == null || yScale == null) {
        throw new Error("XYPlots require an xScale and yScale");
      }
      this.classed("xy-plot", true);

      this.project("x", "x", xScale); // default accessor
      this.project("y", "y", yScale); // default accessor
    }

    /**
     * @param {string} attrToSet One of ["x", "y"] which determines the point's
     * x and y position in the Plot.
     */
    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      // We only want padding and nice-ing on scales that will correspond to axes / pixel layout.
      // So when we get an "x" or "y" scale, enable autoNiceing and autoPadding.
      if (attrToSet === "x" && scale) {
        this._xScale = scale;
        this._updateXDomainer();
        scale.broadcaster.registerListener("yDomainAdjustment" + this._plottableID, () => this.adjustDomain(true));
      }

      if (attrToSet === "y" && scale) {
        this._yScale = scale;
        this._updateYDomainer();
        scale.broadcaster.registerListener("xDomainAdjustment" + this._plottableID, () => this.adjustDomain(false));
      }

      super.project(attrToSet, accessor, scale);

      return this;
    }

    /**
     * Sets the automatic domain adjustment over visible points for y scale.
     *
     * @param {boolean} autoAdjustment The new value for the automatic adjustment domain for y scale.
     * @returns {AbstractXYPlot} The calling AbstractXYPlot.
     */
    public autoAdjustmentYScaleOverVisiblePoints(autoAdjustment: boolean): AbstractXYPlot<X,Y> {
      this._autoDomainYScale = autoAdjustment;
      return this;
    }

    /**
     * Sets the automatic domain adjustment over visible points for x scale.
     *
     * @param {boolean} autoAdjustment The new value for the automatic adjustment domain for x scale.
     * @returns {AbstractXYPlot} The calling AbstractXYPlot.
     */
    public autoAdjustmentXScaleOverVisiblePoints(autoAdjustment: boolean): AbstractXYPlot<X,Y>  {
      this._autoDomainXScale = autoAdjustment;
      return this;
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this._xScale.range([0, this.width()]);
      this._yScale.range([this.height(), 0]);
    }

    public _updateXDomainer() {
      if (this._xScale instanceof Scale.AbstractQuantitative) {
        var scale = <Scale.AbstractQuantitative<any>> this._xScale;
        if (!scale._userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }

    public _updateYDomainer() {
      if (this._yScale instanceof Scale.AbstractQuantitative) {
        var scale = <Scale.AbstractQuantitative<any>> this._yScale;
        if (!scale._userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }

    /**
     * Adjust both domains to show all datasets.
     *
     * This call does not override auto domain logic to visible points.
     */
    public showAllData() {
      this._xScale.autoDomain();
      if(!this._autoDomainYScale) {
        this._yScale.autoDomain();
      }
    }

    private adjustDomain(xDomainChanged: boolean) {
      var autoDomain = xDomainChanged ? this._autoDomainYScale : this._autoDomainXScale;
      var changedScale: Scale.AbstractScale<any, any> = xDomainChanged ? this._xScale : this._yScale;
      var adjustingScale: Scale.AbstractScale<any, any> = xDomainChanged ? this._yScale : this._xScale;
      if(autoDomain && adjustingScale instanceof Scale.AbstractQuantitative) {
        var scale = <Scale.AbstractQuantitative<any>> adjustingScale;
        var adjustedDomain: any[] = this.adjustDomainToVisiblePoints(this.normalizeDatasets(), changedScale.domain());
        adjustedDomain = scale.domainer().computeDomain([adjustedDomain], scale);
        scale._setDomain(adjustedDomain);
      }
    }

    private normalizeDatasets() {
      var flattenDatasets = _Util.Methods.flatten(this.datasets().map(d => d.data()));
      return flattenDatasets.map(d => { return { x: this._projectors["x"].accessor(d), y: this._projectors["y"].accessor(d) }; });
    }

    private adjustDomainToVisiblePoints(values: Point[], affectedDomain: any[]): any[] {
      var visiblePoints = values.filter(d => d.x >= affectedDomain[0] && d.x <= affectedDomain[1]);
      var yValues = visiblePoints.map(d => d.y);
      if (yValues.length === 0) {
        yValues = [0];
      }

      return [_Util.Methods.min(yValues), _Util.Methods.max(yValues)];
    }
  }
}
}
