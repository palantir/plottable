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
     * @param {QuantitativeScaleScale} xScale The x scale to use.
     * @param {QuantitativeScaleScale} yScale The y scale to use.
     */
    constructor(xScale: QuantitativeScale<X>, yScale: QuantitativeScale<number>) {
      super(xScale, yScale);
      this.classed("area-plot", true);
      this._isVertical = true;
    }

    protected _getDrawer(key: string) {
      return new Plottable.Drawers.Area(key).drawLine(false);
    }

    public _getAnimator(key: string): Animators.PlotAnimator {
      return new Animators.Null();
    }

    protected setup() {
      super.setup();
      this._baseline = this._renderArea.append("line").classed("baseline", true);
    }

    protected _additionalPaint() {
      var scaledBaseline = this._yScale.scale(this._baselineValue);
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
      var scale = <QuantitativeScale<any>> this._yScale;
      if (!scale._userSetDomainer) {
        scale.domainer().addPaddingException(0, "STACKED_AREA_PLOT+" + this.getID())
                        .addIncludedValue(0, "STACKED_AREA_PLOT+" + this.getID());
        // prepending "AREA_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        scale._autoDomainIfAutomaticMode();
      }
    }

    public project(attrToSet: string, accessor: any, scale?: Scale<any, any>) {
      super.project(attrToSet, accessor, scale);
      Stacked.prototype.project.apply(this, [attrToSet, accessor, scale]);
      return this;
    }

    protected _onDatasetUpdate() {
      super._onDatasetUpdate();
      Stacked.prototype._onDatasetUpdate.apply(this);
      return this;
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      if (this._projections["fill-opacity"] == null) {
        attrToProjector["fill-opacity"] = d3.functor(1);
      }

      var yAccessor = this._projections["y"].accessor;
      var xAccessor = this._projections["x"].accessor;
      attrToProjector["y"] = (d: any, i: number, u: any, m: StackedPlotMetadata) =>
        this._yScale.scale(+yAccessor(d, i, u, m) + m.offsets.get(xAccessor(d, i, u, m)));
      attrToProjector["y0"] = (d: any, i: number, u: any, m: StackedPlotMetadata) =>
        this._yScale.scale(m.offsets.get(xAccessor(d, i, u, m)));

      return attrToProjector;
    }

    protected _wholeDatumAttributes() {
      return ["x", "y", "defined"];
    }

    //===== Stack logic from StackedPlot =====
    public _updateStackOffsets() {
      if (!this._projectorsReady()) { return; }
      var domainKeys = this._getDomainKeys();
      var keyAccessor = this._isVertical ? this._projections["x"].accessor : this._projections["y"].accessor;
      var keySets = this._datasetKeysInOrder.map((k) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
        return d3.set(dataset.data().map((datum, i) => keyAccessor(datum, i, dataset.metadata(), plotMetadata).toString())).values();
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

    public _updateScaleExtents() {
      Stacked.prototype._updateScaleExtents.call(this);
    }

    public _keyAccessor(): _Accessor {
      return Stacked.prototype._keyAccessor.call(this);
    }

    public _valueAccessor(): _Accessor {
      return Stacked.prototype._valueAccessor.call(this);
    }

    public _getPlotMetadataForDataset(key: string): StackedPlotMetadata {
      return Stacked.prototype._getPlotMetadataForDataset.call(this, key);
    }

    protected _normalizeDatasets<A, B>(fromX: boolean): {a: A; b: B}[] {
      return Stacked.prototype._normalizeDatasets.call(this, fromX);
    }
    //===== /Stack logic =====
  }
}
}
