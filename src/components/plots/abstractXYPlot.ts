///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class AbstractXYPlot<X,Y> extends AbstractPlot {
    public _xScale: Scale.AbstractScale<X, number>;
    public _yScale: Scale.AbstractScale<Y, number>;
    public _autoAdjustXScaleDomain = false;
    public _autoAdjustYScaleDomain = false;

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

      this._xScale = xScale;
      this._yScale = yScale;
      this._updateXDomainer();
      xScale.broadcaster.registerListener("yDomainAdjustment" + this._plottableID, () => this._adjustYDomainOnChangeFromX());
      this._updateYDomainer();
      yScale.broadcaster.registerListener("xDomainAdjustment" + this._plottableID, () => this._adjustXDomainOnChangeFromY());
    }

    /**
     * @param {string} attrToSet One of ["x", "y"] which determines the point's
     * x and y position in the Plot.
     */
    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      // We only want padding and nice-ing on scales that will correspond to axes / pixel layout.
      // So when we get an "x" or "y" scale, enable autoNiceing and autoPadding.
      if (attrToSet === "x" && scale) {
        if (this._xScale) {
          this._xScale.broadcaster.deregisterListener("yDomainAdjustment" + this._plottableID);
        }
        this._xScale = scale;
        this._updateXDomainer();
        scale.broadcaster.registerListener("yDomainAdjustment" + this._plottableID, () => this._adjustYDomainOnChangeFromX());
      }

      if (attrToSet === "y" && scale) {
        if (this._yScale) {
          this._yScale.broadcaster.deregisterListener("xDomainAdjustment" + this._plottableID);
        }
        this._yScale = scale;
        this._updateYDomainer();
        scale.broadcaster.registerListener("xDomainAdjustment" + this._plottableID, () => this._adjustXDomainOnChangeFromY());
      }

      super.project(attrToSet, accessor, scale);

      return this;
    }

    public remove() {
      super.remove();
      if (this._xScale) {
        this._xScale.broadcaster.deregisterListener("yDomainAdjustment" + this._plottableID);
      }
      if (this._yScale) {
        this._yScale.broadcaster.deregisterListener("xDomainAdjustment" + this._plottableID);
      }
      return this;
    }

    /**
     * Sets the automatic domain adjustment over visible points for y scale.
     *
     * If autoAdjustment is true adjustment is immediately performend.
     *
     * @param {boolean} autoAdjustment The new value for the automatic adjustment domain for y scale.
     * @returns {AbstractXYPlot} The calling AbstractXYPlot.
     */
    public automaticallyAdjustYScaleOverVisiblePoints(autoAdjustment: boolean): AbstractXYPlot<X,Y> {
      this._autoAdjustYScaleDomain = autoAdjustment;
      this._adjustYDomainOnChangeFromX();
      return this;
    }

    /**
     * Sets the automatic domain adjustment over visible points for x scale.
     *
     * If autoAdjustment is true adjustment is immediately performend.
     *
     * @param {boolean} autoAdjustment The new value for the automatic adjustment domain for x scale.
     * @returns {AbstractXYPlot} The calling AbstractXYPlot.
     */
    public automaticallyAdjustXScaleOverVisiblePoints(autoAdjustment: boolean): AbstractXYPlot<X,Y>  {
      this._autoAdjustXScaleDomain = autoAdjustment;
      this._adjustXDomainOnChangeFromY();
      return this;
    }

    public _generateAttrToProjector(): AttributeToProjector {
      var attrToProjector: AttributeToProjector = super._generateAttrToProjector();
      var positionXFn = attrToProjector["x"];
      var positionYFn = attrToProjector["y"];
      attrToProjector["defined"] = (d: any, i: number, u: any, m: PlotMetadata) => {
        var positionX = positionXFn(d, i, u, m);
        var positionY = positionYFn(d, i, u, m);
        return positionX != null && positionX === positionX &&
               positionY != null && positionY === positionY;
      };
      return attrToProjector;
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this._xScale.range([0, this.width()]);
      if (this._yScale instanceof Scale.Ordinal) {
        this._yScale.range([0, this.height()]);
      } else {
        this._yScale.range([this.height(), 0]);
      }
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
      if(!this._autoAdjustYScaleDomain) {
        this._yScale.autoDomain();
      }
    }

    private _adjustYDomainOnChangeFromX() {
      if (!this._projectorsReady()) { return; }
      if(this._autoAdjustYScaleDomain) {
        this._adjustDomainToVisiblePoints<X,Y>(this._xScale, this._yScale, true);
      }
    }
    private _adjustXDomainOnChangeFromY() {
      if (!this._projectorsReady()) { return; }
      if(this._autoAdjustXScaleDomain) {
        this._adjustDomainToVisiblePoints<Y,X>(this._yScale, this._xScale, false);
      }
    }

    private _adjustDomainToVisiblePoints<A,B>(fromScale: Scale.AbstractScale<A, number>,
                                             toScale: Scale.AbstractScale<B, number>,
                                             fromX: boolean) {
      if (toScale instanceof Scale.AbstractQuantitative) {
        var toScaleQ = <Scale.AbstractQuantitative<B>> toScale;
        var normalizedData = this._normalizeDatasets<A,B>(fromX);
        var adjustedDomain = this._adjustDomainOverVisiblePoints<A,B>(normalizedData, fromScale.domain());
        if(adjustedDomain.length === 0) {
          return;
        }
        adjustedDomain = toScaleQ.domainer().computeDomain([adjustedDomain], toScaleQ);
        toScaleQ.domain(adjustedDomain);
      }
    }

    public _normalizeDatasets<A,B>(fromX: boolean): {a: A; b: B;}[] {
      var aAccessor: (d: any, i: number, u: any, m: PlotMetadata) => A = this._projections[fromX ? "x" : "y"].accessor;
      var bAccessor: (d: any, i: number, u: any, m: PlotMetadata) => B = this._projections[fromX ? "y" : "x"].accessor;
      return _Util.Methods.flatten(this._datasetKeysInOrder.map((key: string) => {
        var dataset = this._key2PlotDatasetKey.get(key).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(key).plotMetadata;
        return dataset.data().map((d, i) => {
          return { a: aAccessor(d, i, dataset.metadata(), plotMetadata), b: bAccessor(d, i, dataset.metadata(), plotMetadata) };
        });
      }));
    }

    private _adjustDomainOverVisiblePoints<A,B>(values: {a: A; b: B}[], fromDomain: A[]): B[] {
      var bVals = values.filter(v => fromDomain[0] <= v.a && v.a <= fromDomain[1]).map(v => v.b);
      var retVal: B[] = [];
      if (bVals.length !== 0) {
        retVal = [_Util.Methods.min<B>(bVals, null), _Util.Methods.max<B>(bVals, null)];
      }
      return retVal;
    }

    public _projectorsReady() {
      return this._projections["x"] && this._projections["y"];
    }
  }
}
}
