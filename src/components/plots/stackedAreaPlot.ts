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

    public getAnimator(key: string): Animators.PlotAnimator {
      return new Animators.Null();
    }

    public project(attrToSet: string, accessor: any, scale?: Scale<any, any>) {
      super.project(attrToSet, accessor, scale);
      Stacked.prototype.project.apply(this, [attrToSet, accessor, scale]);
      return this;
    }

    //===== Stack logic from StackedPlot =====
    public generateDefaultMapArray(): D3.Map<StackedDatum>[] {
      return Stacked.prototype.generateDefaultMapArray.call(this);
    }

    public getDomainKeys() {
      return Stacked.prototype.getDomainKeys.call(this);
    }

    public getPlotMetadataForDataset(key: string): StackedPlotMetadata {
      return Stacked.prototype.getPlotMetadataForDataset.call(this, key);
    }

    public keyAccessor(): _Accessor {
      return Stacked.prototype.keyAccessor.call(this);
    }

    protected normalizeDatasets<A, B>(fromX: boolean): {a: A; b: B}[] {
      return Stacked.prototype.normalizeDatasets.call(this, fromX);
    }

    public setDatasetStackOffsets(positiveDataMapArray: D3.Map<StackedDatum>[], negativeDataMapArray: D3.Map<StackedDatum>[]) {
      Stacked.prototype.setDatasetStackOffsets.call(this, positiveDataMapArray, negativeDataMapArray);
    }

    public stack(dataArray: D3.Map<StackedDatum>[]): D3.Map<StackedDatum>[] {
      return Stacked.prototype.stack.call(this, dataArray);
    }

    public updateScaleExtents() {
      Stacked.prototype.updateScaleExtents.call(this);
    }

    public updateStackExtents() {
      Stacked.prototype.updateStackExtents.call(this);
    }

    public updateStackOffsets() {
      if (!this.projectorsReady()) { return; }
      var domainKeys = this.getDomainKeys();
      var keyAccessor = this._isVertical ? this.projections["x"].accessor : this.projections["y"].accessor;
      var keySets = this.datasetKeysInOrder.map((k) => {
        var dataset = this.datasetKeys.get(k).dataset;
        var plotMetadata = this.datasetKeys.get(k).plotMetadata;
        return d3.set(dataset.data().map((datum, i) => keyAccessor(datum, i, dataset.metadata(), plotMetadata).toString())).values();
      });

      if (keySets.some((keySet) => keySet.length !== domainKeys.length)) {
        Utils.Methods.warn("the domains across the datasets are not the same.  Plot may produce unintended behavior.");
      }
      Stacked.prototype.updateStackOffsets.call(this);
    }

    public _valueAccessor(): _Accessor {
      return Stacked.prototype._valueAccessor.call(this);
    }
    //===== /Stack logic =====

    protected additionalPaint() {
      var scaledBaseline = this._yScale.scale(this.baselineValue);
      var baselineAttr: any = {
        "x1": 0,
        "y1": scaledBaseline,
        "x2": this.width(),
        "y2": scaledBaseline
      };

      this.getAnimator("baseline").animate(this.baseline, baselineAttr);
    }

    protected generateAttrToProjector() {
      var attrToProjector = super.generateAttrToProjector();

      if (this.projections["fill-opacity"] == null) {
        attrToProjector["fill-opacity"] = d3.functor(1);
      }

      var yAccessor = this.projections["y"].accessor;
      var xAccessor = this.projections["x"].accessor;
      attrToProjector["y"] = (d: any, i: number, u: any, m: StackedPlotMetadata) =>
        this._yScale.scale(+yAccessor(d, i, u, m) + m.offsets.get(xAccessor(d, i, u, m)));
      attrToProjector["y0"] = (d: any, i: number, u: any, m: StackedPlotMetadata) =>
        this._yScale.scale(m.offsets.get(xAccessor(d, i, u, m)));

      return attrToProjector;
    }

    protected getDrawer(key: string) {
      return new Plottable.Drawers.Area(key).drawLine(false);
    }

    protected onDatasetUpdate() {
      super.onDatasetUpdate();
      Stacked.prototype.onDatasetUpdate.apply(this);
      return this;
    }

    protected setup() {
      super.setup();
      this.baseline = this.renderArea.append("line").classed("baseline", true);
    }

    protected updateYDomainer() {
      super.updateYDomainer();
      var scale = <QuantitativeScale<any>> this._yScale;
      if (!scale.setByUser) {
        scale.domainer().addPaddingException(0, "STACKED_AREA_PLOT+" + this.getID())
                        .addIncludedValue(0, "STACKED_AREA_PLOT+" + this.getID());
        // prepending "AREA_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        scale.autoDomainIfAutomaticMode();
      }
    }

    protected wholeDatumAttributes() {
      return ["x", "y", "defined"];
    }
  }
}
}
