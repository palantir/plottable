///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class StackedArea<X> extends Area<X> {
    private _stackedExtent = [0, 0];

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
      } else {
        super.x(<X | Accessor<X>> x, xScale);
      }

      this._updateStackExtentsAndOffsets();

      return this;
    }

    public y(y?: number | Accessor<number>, yScale?: Scale<number, number>): any {
      if (y == null) {
        return super.y();
      }
      if (yScale == null) {
        super.y(<number | Accessor<number>> y);
      } else {
        super.y(<number | Accessor<number>> y, yScale);
      }

      this._updateStackExtentsAndOffsets();

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
      this._updateStackExtentsAndOffsets();

      super._onDatasetUpdate();
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

    protected _getPlotMetadataForDataset(key: string) {
      var metadata = super._getPlotMetadataForDataset(key);
      return StackedPlotUtils.stackedPlotMetadata(metadata);
    }

    protected _updateExtentsForProperty(property: string) {
      super._updateExtentsForProperty(property);
      if ((property === "x" || property === "y") && this._projectorsReady()) {
        var orientation = this._isVertical ? "vertical" : "horizontal";
        var keyAccessor = StackedPlotUtils.keyAccessor(this, orientation);
        var valueAccessor = StackedPlotUtils.valueAccessor(this, orientation);

        var datasetKeys = this._datasetKeysInOrder;
        var keyToPlotDatasetKey = this._key2PlotDatasetKey;
        var filter = this._filterForProperty(this._isVertical ? "y" : "x");

        var extents = StackedPlotUtils.computeStackExtents(keyAccessor, valueAccessor, datasetKeys, keyToPlotDatasetKey, filter);
        this._stackedExtent = extents;
      }
    }

    protected _extentsForProperty(attr: string) {
      var primaryAttr = this._isVertical ? "y" : "x";
      if (attr === primaryAttr) {
        return [this._stackedExtent];
      } else {
        return super._extentsForProperty(attr);
      }
    }

    private _updateStackExtentsAndOffsets() {
      if (!this._projectorsReady()) {
        return;
      }

      var orientation = this._isVertical ? "vertical" : "horizontal";
      var keyAccessor = StackedPlotUtils.keyAccessor(this, orientation);
      var valueAccessor = StackedPlotUtils.valueAccessor(this, orientation);
      var datasetKeys = this._datasetKeysInOrder;
      var keyToPlotDatasetKey = this._key2PlotDatasetKey;
      var filter = this._filterForProperty(this._isVertical ? "y" : "x");
      var domainKeys = StackedPlotUtils.getDomainKeys(keyAccessor, datasetKeys, keyToPlotDatasetKey);

      var keySets = datasetKeys.map((k) => {
        var dataset = keyToPlotDatasetKey.get(k).dataset;
        var plotMetadata = keyToPlotDatasetKey.get(k).plotMetadata;
        return d3.set(dataset.data().map((datum, i) => keyAccessor(datum, i, dataset, plotMetadata).toString())).values();
      });

      if (keySets.some((keySet) => keySet.length !== domainKeys.length)) {
        Utils.Methods.warn("the domains across the datasets are not the same. Plot may produce unintended behavior.");
      }

      StackedPlotUtils.updateStackOffsets.call(this, keyAccessor, valueAccessor, datasetKeys, keyToPlotDatasetKey);
      this._stackedExtent = StackedPlotUtils.computeStackExtents(keyAccessor, valueAccessor, datasetKeys, keyToPlotDatasetKey, filter);
    }
  }
}
}
