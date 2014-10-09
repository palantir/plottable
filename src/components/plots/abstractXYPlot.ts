///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class AbstractXYPlot<X,Y> extends AbstractPlot {
    public _xScale: Scale.AbstractScale<X, number>;
    public _yScale: Scale.AbstractScale<Y, number>;
    public _adjustmentYScaleDomainAlgorithm: AdjustmentYDomainAlgorithm<X,Y>;
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
        scale.broadcaster.registerListener("yScaleAdjustument" + this._plottableID, () => this._adjustYDomainer());
      }

      if (attrToSet === "y" && scale) {
        this._yScale = scale;
        this._updateYDomainer();
      }

      super.project(attrToSet, accessor, scale);

      return this;
    }

    /**
     * Gets the adjustDomainAlgorithm for y scale.
     *
     * @returns {AdjustmentYDomainAlgorithm} The current adjustDomainAlgorithm for y scale.
     */
    public adjustmentYScaleDomainAlgorithm(): AdjustmentYDomainAlgorithm<X,Y> ;
    /**
     * Sets the adjustDomainAlgorithm for y scale.
     *
     * @param {AdjustmentYDomainAlgorithm} values If provided, the new value for the adjustDomainAlgorithm for y scale.
     * @returns {AbstractXYPlot} The calling AbstractXYPlot.
     */
    public adjustmentYScaleDomainAlgorithm(algorithm: AdjustmentYDomainAlgorithm<X,Y>): AbstractXYPlot<X,Y> ;
    public adjustmentYScaleDomainAlgorithm(algorithm?: AdjustmentYDomainAlgorithm<X,Y>): any {
      if (algorithm == null) {
        return this._adjustmentYScaleDomainAlgorithm;
      } else {
        this._adjustmentYScaleDomainAlgorithm = algorithm;
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

    public _adjustYDomainer() {
      if (this._yScale instanceof Scale.AbstractQuantitative) {
        var scale = <Scale.AbstractQuantitative<any>> this._yScale;
        if (!scale._userSetDomainer) {
          if(this._adjustmentYScaleDomainAlgorithm !== undefined) {
            var adjustedDomain = this._adjustmentYScaleDomainAlgorithm(this.datasets(), this._xScale.domain());
            adjustedDomain = scale.domainer().computeDomain([adjustedDomain], scale);
            scale._setDomain(adjustedDomain);
          }
        }
      }
    }
  }
}
}
