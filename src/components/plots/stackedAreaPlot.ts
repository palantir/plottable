///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class StackedArea<X> extends Area<X> {

    private _isVertical: boolean;
    private baseline: D3.Selection;
    private baselineValue = 0;

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

    protected getDrawer(key: string) {
      return new Plottable.Drawers.Area(key).drawLine(false);
    }

    public getAnimator(key: string): Animators.PlotAnimator {
      return new Animators.Null();
    }

    protected setup() {
      super.setup();
      this.baseline = this._renderArea.append("line").classed("baseline", true);
    }

    protected additionalPaint() {
      var scaledBaseline = this.yScale.scale(this.baselineValue);
      var baselineAttr: any = {
        "x1": 0,
        "y1": scaledBaseline,
        "x2": this.width(),
        "y2": scaledBaseline
      };

      this.getAnimator("baseline").animate(this.baseline, baselineAttr);
    }

    protected updateYDomainer() {
      super.updateYDomainer();
      var scale = <QuantitativeScale<any>> this.yScale;
      if (!scale.userSetDomainer) {
        scale.domainer().addPaddingException(0, "STACKED_AREA_PLOT+" + this.getID())
                        .addIncludedValue(0, "STACKED_AREA_PLOT+" + this.getID());
        // prepending "AREA_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        scale.autoDomainIfAutomaticMode();
      }
    }

    public project(attrToSet: string, accessor: any, scale?: Scale<any, any>) {
      super.project(attrToSet, accessor, scale);
      Stacked.prototype.project.apply(this, [attrToSet, accessor, scale]);
      return this;
    }

    protected onDatasetUpdate() {
      super.onDatasetUpdate();
      Stacked.prototype.onDatasetUpdate.apply(this);
      return this;
    }

    protected generateAttrToProjector() {
      var attrToProjector = super.generateAttrToProjector();

      if (this._projections["fill-opacity"] == null) {
        attrToProjector["fill-opacity"] = d3.functor(1);
      }

      var yAccessor = this._projections["y"].accessor;
      var xAccessor = this._projections["x"].accessor;
      attrToProjector["y"] = (d: any, i: number, u: any, m: StackedPlotMetadata) =>
        this.yScale.scale(+yAccessor(d, i, u, m) + m.offsets.get(xAccessor(d, i, u, m)));
      attrToProjector["y0"] = (d: any, i: number, u: any, m: StackedPlotMetadata) =>
        this.yScale.scale(m.offsets.get(xAccessor(d, i, u, m)));

      return attrToProjector;
    }

    protected wholeDatumAttributes() {
      return ["x", "y", "defined"];
    }

    //===== Stack logic from StackedPlot =====
    public updateStackOffsets() {
      if (!this._projectorsReady()) { return; }
      var domainKeys = this.getDomainKeys();
      var keyAccessor = this._isVertical ? this._projections["x"].accessor : this._projections["y"].accessor;
      var keySets = this._datasetKeysInOrder.map((k) => {
        var dataset = this._key2PlotDatasetKey.get(k).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(k).plotMetadata;
        return d3.set(dataset.data().map((datum, i) => keyAccessor(datum, i, dataset.metadata(), plotMetadata).toString())).values();
      });

      if (keySets.some((keySet) => keySet.length !== domainKeys.length)) {
        Utils.Methods.warn("the domains across the datasets are not the same.  Plot may produce unintended behavior.");
      }
      Stacked.prototype.updateStackOffsets.call(this);
    }

    public updateStackExtents() {
      Stacked.prototype.updateStackExtents.call(this);
    }

    public stack(dataArray: D3.Map<StackedDatum>[]): D3.Map<StackedDatum>[] {
      return Stacked.prototype.stack.call(this, dataArray);
    }

    public setDatasetStackOffsets(positiveDataMapArray: D3.Map<StackedDatum>[], negativeDataMapArray: D3.Map<StackedDatum>[]) {
      Stacked.prototype.setDatasetStackOffsets.call(this, positiveDataMapArray, negativeDataMapArray);
    }

    public getDomainKeys() {
      return Stacked.prototype.getDomainKeys.call(this);
    }

    public generateDefaultMapArray(): D3.Map<StackedDatum>[] {
      return Stacked.prototype.generateDefaultMapArray.call(this);
    }

    public updateScaleExtents() {
      Stacked.prototype.updateScaleExtents.call(this);
    }

    public keyAccessor(): Accessor {
      return Stacked.prototype.keyAccessor.call(this);
    }

    public valueAccessor(): Accessor {
      return Stacked.prototype.valueAccessor.call(this);
    }

    public getPlotMetadataForDataset(key: string): StackedPlotMetadata {
      return Stacked.prototype.getPlotMetadataForDataset.call(this, key);
    }

    protected normalizeDatasets<A, B>(fromX: boolean): {a: A; b: B}[] {
      return Stacked.prototype.normalizeDatasets.call(this, fromX);
    }
    //===== /Stack logic =====
  }
}
}
