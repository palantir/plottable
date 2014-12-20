///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class StackedBar<X,Y> extends Bar<X, Y> {

    /**
     * Constructs a StackedBar plot.
     * A StackedBarPlot is a plot that plots several bar plots stacking on top of each
     * other.
     * @constructor
     * @param {Scale} xScale the x scale of the plot.
     * @param {Scale} yScale the y scale of the plot.
     * @param {boolean} isVertical if the plot if vertical.
     */
    constructor(xScale?: Scale.AbstractScale<X,number>, yScale?: Scale.AbstractScale<Y,number>, isVertical = true) {
      super(xScale, yScale, isVertical);
    }

    protected _getAnimator(key: string): Animator.PlotAnimator {
      if (this._animate && this._animateOnNextRender) {
        if (this.animator(key)) {
          return this.animator(key);
        } else if (key === "stacked-bar") {
          var primaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._yScale : this._xScale;
          var scaledBaseline = primaryScale.scale(this.baseline());
          return new Animator.MovingRect(scaledBaseline, this._isVertical);
        }
      }

      return new Animator.Null();
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      var valueAttr = this._isVertical ? "y" : "x";
      var keyAttr = this._isVertical ? "x" : "y";
      var primaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._yScale : this._xScale;
      var primaryAccessor = this._projections[valueAttr].accessor;
      var keyAccessor = this._projections[keyAttr].accessor;
      var getStart = (d: any, i: number, u: any, m: StackedPlotMetadata) =>
        primaryScale.scale(m.offsets.get(keyAccessor(d, i, u, m)));
      var getEnd = (d: any, i: number, u: any, m: StackedPlotMetadata) =>
        primaryScale.scale(+primaryAccessor(d, i, u, m) + m.offsets.get(keyAccessor(d, i, u, m)));

      var heightF = (d: any, i: number, u: any, m: StackedPlotMetadata) => Math.abs(getEnd(d, i, u, m) - getStart(d, i, u, m));

      var attrFunction = (d: any, i: number, u: any, m: StackedPlotMetadata) =>

        +primaryAccessor(d, i, u, m) < 0 ? getStart(d, i, u, m) : getEnd(d, i, u, m);
      attrToProjector[valueAttr] = (d: any, i: number, u: any, m: StackedPlotMetadata) =>
        this._isVertical ? attrFunction(d, i, u, m) : attrFunction(d, i, u, m) - heightF(d, i, u, m);

      return attrToProjector;
    }

    protected _generateDrawSteps(): _Drawer.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("stacked-bar")}];
    }

    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      super.project(attrToSet, accessor, scale);
      AbstractStacked.prototype.project.apply(this, [attrToSet, accessor, scale]);
      return this;
    }

    protected _onDatasetUpdate() {
      super._onDatasetUpdate();
      AbstractStacked.prototype._onDatasetUpdate.apply(this);
      return this;
    }

    protected _getPlotMetadataForDataset(key: string): StackedPlotMetadata {
      return AbstractStacked.prototype._getPlotMetadataForDataset.call(this, key);
    }

    protected _normalizeDatasets<A,B>(fromX: boolean): {a: A; b: B;}[] {
      return AbstractStacked.prototype._normalizeDatasets.call(this, fromX);
    }

    //===== Stack logic from AbstractStackedPlot =====
    public _updateStackOffsets() {
      AbstractStacked.prototype._updateStackOffsets.call(this);
    }

    public _updateStackExtents() {
      AbstractStacked.prototype._updateStackExtents.call(this);
    }

    public _stack(dataArray: D3.Map<StackedDatum>[]): D3.Map<StackedDatum>[] {
      return AbstractStacked.prototype._stack.call(this, dataArray);
    }

    public _setDatasetStackOffsets(positiveDataMapArray: D3.Map<StackedDatum>[], negativeDataMapArray: D3.Map<StackedDatum>[]) {
      AbstractStacked.prototype._setDatasetStackOffsets.call(this, positiveDataMapArray, negativeDataMapArray);
    }

    public _getDomainKeys() {
      return AbstractStacked.prototype._getDomainKeys.call(this);
    }

    public _generateDefaultMapArray(): D3.Map<StackedDatum>[] {
      return AbstractStacked.prototype._generateDefaultMapArray.call(this);
    }

    public _updateScaleExtents() {
      AbstractStacked.prototype._updateScaleExtents.call(this);
    }

    public _keyAccessor(): _Accessor {
      return AbstractStacked.prototype._keyAccessor.call(this);
    }

    public _valueAccessor(): _Accessor {
      return AbstractStacked.prototype._valueAccessor.call(this);
    }
    //===== /Stack logic =====
  }
}
}
