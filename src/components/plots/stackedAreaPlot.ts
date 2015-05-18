///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class StackedArea<X> extends Area<X> {

    private _isVertical: boolean;
    private _baseline: D3.Selection;
    private _baselineValue = 0;

    /**
     * Constructs a StackedArea plot.
     *
     * @constructor
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(xScale: QuantitativeScale<X>, yScale: QuantitativeScale<number>) {
      super(xScale, yScale);
      this.classed("area-plot", true);
      this._isVertical = true;
      this.attr("fill-opacity", 1);
    }

    protected _getDrawer(key: string) {
      return new Plottable.Drawers.Area(key).drawLine(false);
    }

    public _getAnimator(key: string): Animators.PlotAnimator {
      return new Animators.Null();
    }

    protected _setup() {
      super._setup();
      this._baseline = this._renderArea.append("line").classed("baseline", true);
    }

    public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
      if (x == null) {
        return super.x();
      }
      if (xScale == null) {
        super.x(<number | Accessor<number>> x);
        Stacked.prototype.x.apply(this, [x]);
      } else {
        super.x(<X | Accessor<X>> x, xScale);
        Stacked.prototype.x.apply(this, [x, xScale]);
      }
      return this;
    }

    public y(y?: number | Accessor<number>, yScale?: Scale<number, number>): any {
      if (y == null) {
        return super.y();
      }
      if (yScale == null) {
        super.y(<number | Accessor<number>> y);
        Stacked.prototype.y.apply(this, [y]);
      } else {
        super.y(<number | Accessor<number>> y, yScale);
        Stacked.prototype.y.apply(this, [y, yScale]);
      }
      return this;
    }

    protected _additionalPaint() {
      var scaledBaseline = this.y().scale.scale(this._baselineValue);
      var baselineAttr: any = {
        "x1": 0,
        "y1": scaledBaseline,
        "x2": this.width(),
        "y2": scaledBaseline
      };

      this._getAnimator("baseline").animate(this._baseline, baselineAttr);
    }

    protected _updateYDomainer() {
      super._updateYDomainer();
      var scale = <QuantitativeScale<any>> this.y().scale;
      if (!scale._userSetDomainer) {
        scale.domainer().addPaddingException(this, 0)
                        .addIncludedValue(this, 0);
        // prepending "AREA_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        scale._autoDomainIfAutomaticMode();
      }
    }

    protected _onDatasetUpdate() {
      super._onDatasetUpdate();
      Stacked.prototype._onDatasetUpdate.apply(this);
      return this;
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      var yAccessor = this.y().accessor;
      var xAccessor = this.x().accessor;
      attrToProjector["y"] = (d: any, i: number, dataset: Dataset, m: StackedPlotMetadata) =>
        this.y().scale.scale(+yAccessor(d, i, dataset, m) + m.offsets.get(xAccessor(d, i, dataset, m)));
      attrToProjector["y0"] = (d: any, i: number, dataset: Dataset, m: StackedPlotMetadata) =>
        this.y().scale.scale(m.offsets.get(xAccessor(d, i, dataset, m)));

      return attrToProjector;
    }

    protected _wholeDatumAttributes() {
      return ["x", "y", "defined"];
    }

    // ===== Stack logic from StackedPlot =====
    public _updateStackOffsets() {
      if (!this._projectorsReady()) { return; }
      var domainKeys = this._getDomainKeys();
      var keyAccessor = this._isVertical ? this.x().accessor : this.y().accessor;
      var keySets = this._datasetKeysInOrder.map((k) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
        return d3.set(dataset.data().map((datum, i) => keyAccessor(datum, i, dataset, plotMetadata).toString())).values();
      });

      if (keySets.some((keySet) => keySet.length !== domainKeys.length)) {
        Utils.Methods.warn("the domains across the datasets are not the same.  Plot may produce unintended behavior.");
      }
      Stacked.prototype._updateStackOffsets.call(this);
    }

    public _updateStackExtents() {
      Stacked.prototype._updateStackExtents.call(this);
    }

    public _stack(dataArray: D3.Map<StackedDatum>[]): D3.Map<StackedDatum>[] {
      return Stacked.prototype._stack.call(this, dataArray);
    }

    public _setDatasetStackOffsets(positiveDataMapArray: D3.Map<StackedDatum>[], negativeDataMapArray: D3.Map<StackedDatum>[]) {
      Stacked.prototype._setDatasetStackOffsets.call(this, positiveDataMapArray, negativeDataMapArray);
    }

    public _getDomainKeys() {
      return Stacked.prototype._getDomainKeys.call(this);
    }

    public _generateDefaultMapArray(): D3.Map<StackedDatum>[] {
      return Stacked.prototype._generateDefaultMapArray.call(this);
    }

    protected _extentsForProperty(attr: string) {
      return (<any> Stacked.prototype)._extentsForProperty.call(this, attr);
    }

    public _keyAccessor(): Accessor<X> {
      return Stacked.prototype._keyAccessor.call(this);
    }

    public _valueAccessor(): Accessor<number> {
      return Stacked.prototype._valueAccessor.call(this);
    }

    public _getPlotMetadataForDataset(key: string): StackedPlotMetadata {
      return Stacked.prototype._getPlotMetadataForDataset.call(this, key);
    }

    protected _updateExtentsForProperty(property: string) {
      (<any> Stacked.prototype)._updateExtentsForProperty.call(this, property);
    }
    // ===== /Stack logic =====
  }
}
}
