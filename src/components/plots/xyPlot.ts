///<reference path="../../reference.ts" />

module Plottable {
  export class XYPlot<X, Y> extends Plot {
    private static _X_KEY = "x";
    private static _Y_KEY = "y";
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

      this._propertyBindings.set(XYPlot._X_KEY, { accessor: null, scale: xScale });
      this._propertyBindings.set(XYPlot._Y_KEY, { accessor: null, scale: yScale});

      this._adjustYDomainOnChangeFromXCallback = (scale) => this._adjustYDomainOnChangeFromX();
      this._adjustXDomainOnChangeFromYCallback = (scale) => this._adjustXDomainOnChangeFromY();

      this._updateXDomainer();
      xScale.onUpdate(this._adjustYDomainOnChangeFromXCallback);

      this._updateYDomainer();
      yScale.onUpdate(this._adjustXDomainOnChangeFromYCallback);
    }

    public x(): Plots.AccessorScaleBinding<X, number>;
    public x(x: number | _Accessor): XYPlot<X, Y>;
    public x(x: X | _Accessor, xScale: Scale<X, number>): XYPlot<X, Y>;
    public x(x?: number | _Accessor | X, xScale?: Scale<X, number>): any {
      if (x == null) {
        return this._propertyBindings.get(XYPlot._X_KEY);
      }
      if (xScale != null) {
        if (this.x().scale) {
          this.x().scale.offUpdate(this._adjustYDomainOnChangeFromXCallback);
        }
        this.x().scale = xScale;
        this._updateXDomainer();

        xScale.onUpdate(this._adjustYDomainOnChangeFromXCallback);
      }

      this._setupProperty(XYPlot._X_KEY, x, xScale);
      this._render();
      return this;
    }

    public y(): Plots.AccessorScaleBinding<Y, number>;
    public y(y: number | _Accessor): XYPlot<X, Y>;
    public y(y: Y | _Accessor, yScale: Scale<Y, number>): XYPlot<X, Y>;
    public y(y?: number | _Accessor | Y, yScale?: Scale<Y, number>): any {
      if (y == null) {
        return this._propertyBindings.get(XYPlot._Y_KEY);
      }

      if (yScale != null) {
        if (this.y().scale) {
          this.y().scale.offUpdate(this._adjustXDomainOnChangeFromYCallback);
        }
        this.y().scale = yScale;
        this._updateYDomainer();
        yScale.onUpdate(this._adjustXDomainOnChangeFromYCallback);
      }

      this._setupProperty(XYPlot._Y_KEY, y, yScale);
      this._render();
      return this;
    }

    public destroy() {
      super.destroy();
      if (this.x().scale) {
        this.x().scale.offUpdate(this._adjustYDomainOnChangeFromXCallback);
      }
      if (this.y().scale) {
        this.y().scale.offUpdate(this._adjustXDomainOnChangeFromYCallback);
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

    protected _propertyToProjectors(): AttributeToProjector {
      var attrToProjector = super._propertyToProjectors();
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

    protected _updateXDomainer() {
      if (this.x().scale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale<any>> this.x().scale;
        if (!scale._userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }

    protected _updateYDomainer() {
      if (this.y().scale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale<any>> this.y().scale;
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
      this.x().scale.autoDomain();
      if (!this._autoAdjustYScaleDomain) {
        this.y().scale.autoDomain();
      }
    }

    private _adjustYDomainOnChangeFromX() {
      if (!this._projectorsReady()) { return; }
      if (this._autoAdjustYScaleDomain) {
        this._adjustDomainToVisiblePoints<X, Y>(this.x().scale, this.y().scale, true);
      }
    }
    private _adjustXDomainOnChangeFromY() {
      if (!this._projectorsReady()) { return; }
      if (this._autoAdjustXScaleDomain) {
        this._adjustDomainToVisiblePoints<Y, X>(this.y().scale, this.x().scale, false);
      }
    }

    private _adjustDomainToVisiblePoints<A, B>(fromScale: Scale<A, number>,
                                             toScale: Scale<B, number>,
                                             fromX: boolean) {
      if (toScale instanceof QuantitativeScale) {
        var toScaleQ = <QuantitativeScale<B>> toScale;
        var normalizedData = this._normalizeDatasets<A, B>(fromX);

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

    protected _normalizeDatasets<A, B>(fromX: boolean): {a: A; b: B}[] {
      var aAccessor: (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => A = fromX ? this.x().accessor : this.y().accessor;
      var bAccessor: (d: any, i: number, dataset: Dataset, m: Plots.PlotMetadata) => B = fromX ? this.y().accessor : this.x().accessor;
      return Utils.Methods.flatten(this._datasetKeysInOrder.map((key: string) => {
        var dataset = this._key2PlotDatasetKey.get(key).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(key).plotMetadata;
        return dataset.data().map((d, i) => {
          return { a: aAccessor(d, i, dataset, plotMetadata), b: bAccessor(d, i, dataset, plotMetadata) };
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
      return this.x().accessor != null && this.y().accessor != null;
    }
  }
}
