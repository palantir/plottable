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

    public x(): Plots.AccessorScaleBinding<X, number>;
    public x(x: number | _Accessor): StackedBar<X, Y>;
    public x(x: X | _Accessor, xScale: Scale<X, number>): StackedBar<X, Y>;
    public x(x?: number | _Accessor | X, xScale?: Scale<X, number>): any {
      if (x == null) {
        return super.x();
      }
      super.x(<any> x, xScale);
      Stacked.prototype.x.apply(this, [x, xScale]);
      return this;
    }

    public y(): Plots.AccessorScaleBinding<Y, number>;
    public y(y: number | _Accessor): StackedBar<X, Y>;
    public y(y: Y | _Accessor, yScale: Scale<Y, number>): StackedBar<X, Y>;
    public y(y?: number | _Accessor | Y, yScale?: Scale<Y, number>): any {
      if (y == null) {
        return super.y();
      }
      super.y(<any> y, yScale);
      Stacked.prototype.y.apply(this, [y, yScale]);
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
      super._onDatasetUpdate();
      Stacked.prototype._onDatasetUpdate.apply(this);
      return this;
    }

    protected _getPlotMetadataForDataset(key: string): StackedPlotMetadata {
      return Stacked.prototype._getPlotMetadataForDataset.call(this, key);
    }

    protected _normalizeDatasets<A, B>(fromX: boolean): {a: A; b: B}[] {
      return Stacked.prototype._normalizeDatasets.call(this, fromX);
    }

    // ===== Stack logic from StackedPlot =====
    public _updateStackOffsets() {
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

    public _keyAccessor(): _Accessor {
      return Stacked.prototype._keyAccessor.call(this);
    }

    public _valueAccessor(): _Accessor {
      return Stacked.prototype._valueAccessor.call(this);
    }
    // ===== /Stack logic =====
  }
}
}
