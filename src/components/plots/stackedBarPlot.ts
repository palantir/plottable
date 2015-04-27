///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class StackedBar<X, Y> extends Bar<X, Y> {

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

    public keyAccessor(): _Accessor {
      return Stacked.prototype.keyAccessor.call(this);
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
      Stacked.prototype.updateStackOffsets.call(this);
    }

    public _valueAccessor(): _Accessor {
      return Stacked.prototype._valueAccessor.call(this);
    }
    //===== /Stack logic =====

    protected generateAttrToProjector() {
      var attrToProjector = super.generateAttrToProjector();

      var valueAttr = this._isVertical ? "y" : "x";
      var keyAttr = this._isVertical ? "x" : "y";
      var primaryScale: Scale<any, number> = this._isVertical ? this._yScale : this._xScale;
      var primaryAccessor = this.projections[valueAttr].accessor;
      var keyAccessor = this.projections[keyAttr].accessor;
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

    protected generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this.generateAttrToProjector(), animator: this.getAnimator("stacked-bar")}];
    }

    protected getAnimator(key: string): Animators.PlotAnimator {
      if (this.animated && this.animateOnNextRender) {
        if (this.animator(key)) {
          return this.animator(key);
        } else if (key === "stacked-bar") {
          var primaryScale: Scale<any, number> = this._isVertical ? this._yScale : this._xScale;
          var scaledBaseline = primaryScale.scale(this.baseline());
          return new Animators.MovingRect(scaledBaseline, this._isVertical);
        }
      }

      return new Animators.Null();
    }

    protected getPlotMetadataForDataset(key: string): StackedPlotMetadata {
      return Stacked.prototype.getPlotMetadataForDataset.call(this, key);
    }

    protected normalizeDatasets<A, B>(fromX: boolean): {a: A; b: B}[] {
      return Stacked.prototype.normalizeDatasets.call(this, fromX);
    }

    protected onDatasetUpdate() {
      super.onDatasetUpdate();
      Stacked.prototype.onDatasetUpdate.apply(this);
      return this;
    }
  }
}
}
