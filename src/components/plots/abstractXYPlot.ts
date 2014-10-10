///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class AbstractXYPlot<X,Y> extends AbstractPlot {
    public _xScale: Scale.AbstractScale<X, number>;
    public _yScale: Scale.AbstractScale<Y, number>;
    public _adjustmentYScaleDomainPolicy: AdjustmentDomainPolicy<X,Y>;
    public _adjustmentXScaleDomainPolicy: AdjustmentDomainPolicy<Y,X>;

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
        scale.broadcaster.registerListener("yDomainAdjustment" + this._plottableID, () => this._adjustDomain(true));
      }

      if (attrToSet === "y" && scale) {
        this._yScale = scale;
        this._updateYDomainer();
        scale.broadcaster.registerListener("xDomainAdjustment" + this._plottableID, () => this._adjustDomain(false));
      }

      super.project(attrToSet, accessor, scale);

      return this;
    }

    /**
     * Gets the adjustment domain policy for y scale.
     *
     * @returns {AdjustmentDomainPolicy} The current adjustment domain policy for y scale.
     */
    public adjustmentYScaleDomainPolicy(): AdjustmentDomainPolicy<X,Y> ;
    /**
     * Sets the adjustment domain policy for y scale.
     *
     * @param {AdjustmentDomainPolicy} policy The new value for the adjustment domain policy for y scale.
     * @returns {AbstractXYPlot} The calling AbstractXYPlot.
     */
    public adjustmentYScaleDomainPolicy(policy: AdjustmentDomainPolicy<X,Y>): AbstractXYPlot<X,Y> ;
    public adjustmentYScaleDomainPolicy(policy?: AdjustmentDomainPolicy<X,Y>): any {
      if (policy == null) {
        return this._adjustmentYScaleDomainPolicy;
      } else {
        this._adjustmentYScaleDomainPolicy = policy;
        return this;
      }
    }

    /**
     * Gets the adjustDmentomainAlgorithm for x scale.
     *
     * @returns {AdjustmentDomainPolicy} The current adjustDomainAlgorithm for x scale.
     */
    public adjustmentXScaleDomainPolicy(): AdjustmentDomainPolicy<Y,X> ;
    /**
     * Sets the adjustDomainAlgorithm for x scale.
     *
     * @param {AdjustmentDomainPolicy} policy The new value for the adjustDomainAlgorithm for x scale.
     * @returns {AbstractXYPlot} The calling AbstractXYPlot.
     */
    public adjustmentXScaleDomainPolicy(policy: AdjustmentDomainPolicy<Y,X>): AbstractXYPlot<X,Y> ;
    public adjustmentXScaleDomainPolicy(policy?: AdjustmentDomainPolicy<Y,X>): any {
      if (policy == null) {
        return this._adjustmentXScaleDomainPolicy;
      } else {
        this._adjustmentXScaleDomainPolicy = policy;
        return this;
      }
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

    public _adjustDomain(xDomainChanged: boolean) {
      var adjustmentPolicy: AdjustmentDomainPolicy<any, any> = xDomainChanged ?
        this._adjustmentYScaleDomainPolicy : this._adjustmentXScaleDomainPolicy;
      var changedScale: Scale.AbstractScale<any, any> = xDomainChanged ? this._xScale : this._yScale;
      var adjustingScale: Scale.AbstractScale<any, any> = xDomainChanged ? this._yScale : this._xScale;
      if(adjustmentPolicy != null) {
        var flattenDatasets = _Util.Methods.flatten(this.datasets().map(d => d.data()));
        var values = flattenDatasets.map(d => { return { x: this._projectors["x"].accessor(d), y: this._projectors["y"].accessor(d) }; });
        var adjustedDomain: any[] = adjustmentPolicy(values, changedScale.domain());
        if (adjustingScale instanceof Scale.AbstractQuantitative) {
          var scale = <Scale.AbstractQuantitative<any>> adjustingScale;
          if (!scale._userSetDomainer) {
            adjustedDomain = scale.domainer().computeDomain([adjustedDomain], scale);
            scale._setDomain(adjustedDomain);
          }
        } else {
          adjustingScale._setDomain(adjustedDomain);
        }
      }
    }
  }
}
}
