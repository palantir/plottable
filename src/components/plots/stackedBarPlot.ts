///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class StackedBar<X, Y> extends Bar<X, Y> {
    private _stackedExtent = [0, 0];

    /**
     * Constructs a StackedBar plot.
     * A StackedBarPlot is a plot that plots several bar plots stacking on top of each
     * other.
     * @constructor
     * @param {Scale} xScale the x scale of the plot.
     * @param {Scale} yScale the y scale of the plot.
     * @param {boolean} isVertical if the plot if vertical.
     */
    constructor(xScale?: Scale<X, number>, yScale?: Scale<Y, number>, isVertical = true) {
      super(xScale, yScale, isVertical);
    }

    protected _getAnimator(key: string): Animators.PlotAnimator {
      if (this._animate && this._animateOnNextRender) {
        if (this.animator(key)) {
          return this.animator(key);
        } else if (key === "stacked-bar") {
          var primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
          var scaledBaseline = primaryScale.scale(this.baseline());
          return new Animators.MovingRect(scaledBaseline, this._isVertical);
        }
      }

      return new Animators.Null();
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

      this._doStackUpdate();
      return this;
    }

    public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
      if (y == null) {
        return super.y();
      }
      if (yScale == null) {
        super.y(<number | Accessor<number>> y);
      } else {
        super.y(<Y | Accessor<Y>> y, yScale);
      }

      this._doStackUpdate();
      return this;
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      var valueAttr = this._isVertical ? "y" : "x";
      var keyAttr = this._isVertical ? "x" : "y";
      var primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
      var primaryAccessor = this._propertyBindings.get(valueAttr).accessor;
      var keyAccessor = this._propertyBindings.get(keyAttr).accessor;
      var getStart = (d: any, i: number, dataset: Dataset, m: StackedPlotMetadata) =>
        primaryScale.scale(m.offsets.get(keyAccessor(d, i, dataset, m)));
      var getEnd = (d: any, i: number, dataset: Dataset, m: StackedPlotMetadata) =>
        primaryScale.scale(+primaryAccessor(d, i, dataset, m) + m.offsets.get(keyAccessor(d, i, dataset, m)));

      var heightF = (d: any, i: number, dataset: Dataset, m: StackedPlotMetadata) => {
        return Math.abs(getEnd(d, i, dataset, m) - getStart(d, i, dataset, m));
      };

      var attrFunction = (d: any, i: number, dataset: Dataset, m: StackedPlotMetadata) =>
        +primaryAccessor(d, i, dataset, m) < 0 ? getStart(d, i, dataset, m) : getEnd(d, i, dataset, m);
      attrToProjector[valueAttr] = (d: any, i: number, dataset: Dataset, m: StackedPlotMetadata) =>
        this._isVertical ? attrFunction(d, i, dataset, m) : attrFunction(d, i, dataset, m) - heightF(d, i, dataset, m);

      return attrToProjector;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("stacked-bar")}];
    }

    protected _onDatasetUpdate() {
      this._doStackUpdate();
      super._onDatasetUpdate();
      return this;
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

        var extents = StackedPlotUtils.updateStackExtents(keyAccessor, valueAccessor, datasetKeys, keyToPlotDatasetKey, filter);
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

    private _doStackUpdate() {
      var orientation = this._isVertical ? "vertical" : "horizontal";
      var keyAccessor = StackedPlotUtils.keyAccessor(this, orientation);
      var valueAccessor = StackedPlotUtils.valueAccessor(this, orientation);

      var datasetKeys = this._datasetKeysInOrder;
      var keyToPlotDatasetKey = this._key2PlotDatasetKey;
      var filter = this._filterForProperty(this._isVertical ? "y" : "x");

      if (this._projectorsReady()) {
        Stacked.prototype._updateStackOffsets.call(this, keyAccessor, valueAccessor, datasetKeys, keyToPlotDatasetKey);
        this._stackedExtent = StackedPlotUtils.updateStackExtents(keyAccessor, valueAccessor, datasetKeys, keyToPlotDatasetKey, filter);
      }
    }

    // ===== Stack logic from StackedPlot =====
    public _updateStackOffsets() {
      Stacked.prototype._updateStackOffsets.call(this);
    }

    // ===== /Stack logic =====
  }
}
}
