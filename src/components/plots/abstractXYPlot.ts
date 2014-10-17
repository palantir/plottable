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
        scale.broadcaster.registerListener("yDomainAdjustment" + this._plottableID, () => this.adjustYDomainOnChangeFromX());
      }

      if (attrToSet === "y" && scale) {
        this._yScale = scale;
        this._updateYDomainer();
        scale.broadcaster.registerListener("xDomainAdjustment" + this._plottableID, () => this.adjustXDomainOnChangeFromY());
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
     * Adjusts both domains' extents to show all datasets.
     *
     * This call does not override auto domain adjustment behavior over visible points.
     */
    public showAllData() {
      this._xScale.autoDomain();
      if(!this._autoDomainYScale) {
        this._yScale.autoDomain();
      }
    }

    private adjustYDomainOnChangeFromX() {
      this.adjustDomainToVisiblePoints<X,Y>(this._xScale, this._yScale, true);
    }
    private adjustXDomainOnChangeFromY() {
      this.adjustDomainToVisiblePoints<Y,X>(this._yScale, this._xScale, false);
    }

    private adjustDomainToVisiblePoints<A,B>(fromScale: Scale.AbstractScale<A, number>, toScale: Scale.AbstractScale<B, number>, fromX: boolean): void {
      if (toScale instanceof Scale.AbstractQuantitative) {
        var toScaleQ = <Scale.AbstractQuantitative<B>> toScale;
        var normalizedData = this.normalizeDatasets<A,B>(fromX);
        var adjustedDomain = this.adjustDomainOverVisiblePoints<A,B>(normalizedData, fromScale.domain());
        adjustedDomain = toScaleQ.domainer().computeDomain([adjustedDomain], toScaleQ);
        toScaleQ._setDomain(adjustedDomain);
      }
    }

    private normalizeDatasets<A,B>(fromX: boolean): {a: A; b: B;}[] {
      var flattenDatasets = _Util.Methods.flatten(this.datasets().map(d => d.data()));
      var aAccessor: (d: any, i: number) => A = this._projectors[fromX ? "x" : "y"].accessor;
      var bAccessor: (d: any, i: number) => B = this._projectors[fromX ? "y" : "x"].accessor;
      return flattenDatasets.map((d, i) => { return { a: aAccessor(d, i), b: bAccessor(d, i) }; });
    }

    private adjustDomainOverVisiblePoints<A,B>(values: {a: A; b: B}[], fromDomain: A[]): B[] {
      var bVals = values
                    .map(v => v.b)
                    .filter(b => _Util.Methods.inRange(+b, +fromDomain[0], +fromDomain[1]));

      var retVal: any[];
      if (bVals.length === 0) {
        retVal = [0, 0];
      } else {
        var acc = (b: B) => +b;
        retVal = [_Util.Methods.min(bVals, acc), _Util.Methods.max(bVals, acc)];
      }
      return retVal;
    }
  }
}
}
