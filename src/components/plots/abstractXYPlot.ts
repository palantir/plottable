///<reference path="../../reference.ts" />

module Plottable {
  export class XYPlot<X, Y> extends Plot {
    protected xScale: Scale<X, number>;
    protected yScale: Scale<Y, number>;
    private _autoAdjustXScaleDomain = false;
    private _autoAdjustYScaleDomain = false;

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

      this.xScale = xScale;
      this.yScale = yScale;
      this._updateXDomainer();
      xScale.broadcaster.registerListener("yDomainAdjustment" + this.getID(), () => this._adjustYDomainOnChangeFromX());
      this.updateYDomainer();
      yScale.broadcaster.registerListener("xDomainAdjustment" + this.getID(), () => this._adjustXDomainOnChangeFromY());
    }

    /**
     * @param {string} attrToSet One of ["x", "y"] which determines the point's
     * x and y position in the Plot.
     */
    public project(attrToSet: string, accessor: any, scale?: Scale<any, any>) {
      // We only want padding and nice-ing on scales that will correspond to axes / pixel layout.
      // So when we get an "x" or "y" scale, enable autoNiceing and autoPadding.
      if (attrToSet === "x" && scale) {
        if (this.xScale) {
          this.xScale.broadcaster.deregisterListener("yDomainAdjustment" + this.getID());
        }
        this.xScale = scale;
        this._updateXDomainer();
        scale.broadcaster.registerListener("yDomainAdjustment" + this.getID(), () => this._adjustYDomainOnChangeFromX());
      }

      if (attrToSet === "y" && scale) {
        if (this.yScale) {
          this.yScale.broadcaster.deregisterListener("xDomainAdjustment" + this.getID());
        }
        this.yScale = scale;
        this.updateYDomainer();
        scale.broadcaster.registerListener("xDomainAdjustment" + this.getID(), () => this._adjustXDomainOnChangeFromY());
      }

      super.project(attrToSet, accessor, scale);

      return this;
    }

    public remove() {
      super.remove();
      if (this.xScale) {
        this.xScale.broadcaster.deregisterListener("yDomainAdjustment" + this.getID());
      }
      if (this.yScale) {
        this.yScale.broadcaster.deregisterListener("xDomainAdjustment" + this.getID());
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
      this._adjustXDomainOnChangeFromY();
      return this;
    }

    protected generateAttrToProjector(): AttributeToProjector {
      var attrToProjector: AttributeToProjector = super.generateAttrToProjector();
      var positionXFn = attrToProjector["x"];
      var positionYFn = attrToProjector["y"];
      attrToProjector["defined"] = (d: any, i: number, u: any, m: Plots.PlotMetadata) => {
        var positionX = positionXFn(d, i, u, m);
        var positionY = positionYFn(d, i, u, m);
        return positionX != null && positionX === positionX &&
               positionY != null && positionY === positionY;
      };
      return attrToProjector;
    }

    public computeLayout(offeredXOrigin?: number, offeredYOffset?: number, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(offeredXOrigin, offeredYOffset, availableWidth, availableHeight);
      this.xScale.range([0, this.width()]);
      if (this.yScale instanceof Scales.Category) {
        this.yScale.range([0, this.height()]);
      } else {
        this.yScale.range([this.height(), 0]);
      }
    }

    protected _updateXDomainer() {
      if (this.xScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale<any>> this.xScale;
        if (!scale.userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }

    protected updateYDomainer() {
      if (this.yScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale<any>> this.yScale;
        if (!scale.userSetDomainer) {
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
      this.xScale.autoDomain();
      if (!this._autoAdjustYScaleDomain) {
        this.yScale.autoDomain();
      }
    }

    private _adjustYDomainOnChangeFromX() {
      if (!this._projectorsReady()) { return; }
      if (this._autoAdjustYScaleDomain) {
        this._adjustDomainToVisiblePoints<X, Y>(this.xScale, this.yScale, true);
      }
    }
    private _adjustXDomainOnChangeFromY() {
      if (!this._projectorsReady()) { return; }
      if (this._autoAdjustXScaleDomain) {
        this._adjustDomainToVisiblePoints<Y, X>(this.yScale, this.xScale, false);
      }
    }

    private _adjustDomainToVisiblePoints<A, B>(fromScale: Scale<A, number>,
                                             toScale: Scale<B, number>,
                                             fromX: boolean) {
      if (toScale instanceof QuantitativeScale) {
        var toScaleQ = <QuantitativeScale<B>> toScale;
        var normalizedData = this.normalizeDatasets<A, B>(fromX);

        var filterFn: (v: A) => boolean;
        if (fromScale instanceof QuantitativeScale) {
          var fromDomain = fromScale.domain();
          filterFn = (a: A) => fromDomain[0] <= a && fromDomain[1] >= a;
        } else {
          var fromDomainSet = d3.set(fromScale.domain());
          filterFn = (a: A) => fromDomainSet.has(a);
        }

        var adjustedDomain = this._adjustDomainOverVisiblePoints<A, B>(normalizedData, filterFn);
        if (adjustedDomain.length === 0) {
          return;
        }
        adjustedDomain = toScaleQ.domainer().computeDomain([adjustedDomain], toScaleQ);
        toScaleQ.domain(adjustedDomain);
      }
    }

    protected normalizeDatasets<A, B>(fromX: boolean): {a: A; b: B}[] {
      var aAccessor: (d: any, i: number, u: any, m: Plots.PlotMetadata) => A = this._projections[fromX ? "x" : "y"].accessor;
      var bAccessor: (d: any, i: number, u: any, m: Plots.PlotMetadata) => B = this._projections[fromX ? "y" : "x"].accessor;
      return Utils.Methods.flatten(this._datasetKeysInOrder.map((key: string) => {
        var dataset = this._key2PlotDatasetKey.get(key).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(key).plotMetadata;
        return dataset.data().map((d, i) => {
          return { a: aAccessor(d, i, dataset.metadata(), plotMetadata), b: bAccessor(d, i, dataset.metadata(), plotMetadata) };
        });
      }));
    }

    private _adjustDomainOverVisiblePoints<A, B>(values: {a: A; b: B}[], filterFn: (v: any) => boolean): B[] {
      var bVals = values.filter(v => filterFn(v.a)).map(v => v.b);
      var retVal: B[] = [];
      if (bVals.length !== 0) {
        retVal = [Utils.Methods.min<B>(bVals, null), Utils.Methods.max<B>(bVals, null)];
      }
      return retVal;
    }

    protected _projectorsReady() {
      return this._projections["x"] && this._projections["y"];
    }
  }
}
