///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class StackedBar<X,Y> extends AbstractBarPlot<X, Y> {
    public _baselineValue: number;
    public _baseline: D3.Selection;
    public _barAlignmentFactor: number;

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
      this._isVertical = isVertical; // Has to be set before super()
      this._baselineValue = 0;
      this._barAlignmentFactor = 0.5;
      super(xScale, yScale);
      this.classed("bar-plot", true);
      this.project("fill", () => Core.Colors.INDIGO);
      this.baseline(this._baselineValue);
      this._isVertical = isVertical;
    }

    public _getAnimator(key: string): Animator.PlotAnimator {
      if(this._animate && this._animateOnNextRender) {
        var primaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._yScale : this._xScale;
        var scaledBaseline = primaryScale.scale(this._baselineValue);
        return new Animator.MovingRect(scaledBaseline, this._isVertical);
      } else {
        return new Animator.Null();
      }
    }

    public _generateAttrToProjector() {
      var attrToProjector = AbstractBarPlot.prototype._generateAttrToProjector.apply(this);

      var primaryAttr = this._isVertical ? "y" : "x";
      var primaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._yScale : this._xScale;
      var primaryAccessor = this._projectors[primaryAttr].accessor;
      var getStart = (d: any) => primaryScale.scale(d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
      var getEnd = (d: any) => primaryScale.scale(+primaryAccessor(d) + d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);

      var heightF = (d: any) => Math.abs(getEnd(d) - getStart(d));
      var widthF = attrToProjector["width"];
      attrToProjector["height"] = this._isVertical ? heightF : widthF;
      attrToProjector["width"] = this._isVertical ? widthF : heightF;

      var attrFunction = (d: any) => +primaryAccessor(d) < 0 ? getStart(d) : getEnd(d);
      attrToProjector[primaryAttr] = (d: any) => this._isVertical ? attrFunction(d) : attrFunction(d) - heightF(d);
      return attrToProjector;
    }

    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      super.project(attrToSet, accessor, scale);
      AbstractStacked.prototype.project.apply(this, [attrToSet, accessor, scale]);
      return this;
    }

    public _onDatasetUpdate() {
      super._onDatasetUpdate();
      AbstractStacked.prototype._onDatasetUpdate.apply(this);
      return this;
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

    public _keyAccessor(): AppliedAccessor {
      return AbstractStacked.prototype._keyAccessor.call(this);
    }

    public _valueAccessor(): AppliedAccessor {
      return AbstractStacked.prototype._valueAccessor.call(this);
    }
    //===== /Stack logic =====
  }
}
}
