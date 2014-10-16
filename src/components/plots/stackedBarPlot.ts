///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class StackedBar<X,Y> extends AbstractStacked<X, Y> {
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

    public _setup() {
      AbstractBarPlot.prototype._setup.call(this);
    }

    public _getAnimator(key: string): Animator.PlotAnimator {
      if(!this._animate) {
        return new Animator.Null();
      } else {
        var primaryScale: Scale.AbstractScale<any,number> = this._isVertical ? this._yScale : this._xScale;
        var scaledBaseline = primaryScale.scale(this._baselineValue);
        return new Animator.MovingRect(scaledBaseline, this._isVertical);
      }
    }

    public _getDrawer(key: string) {
      return AbstractBarPlot.prototype._getDrawer.apply(this, [key]);
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

     public _additionalPaint() {
      AbstractBarPlot.prototype._additionalPaint.apply(this);
    }

    public baseline(value: number) {
      return AbstractBarPlot.prototype.baseline.apply(this, [value]);
    }

    public _updateDomainer(scale: Scale.AbstractScale<any,number>) {
      return AbstractBarPlot.prototype._updateDomainer.apply(this, [scale]);
    }

    public _updateXDomainer() {
      return AbstractBarPlot.prototype._updateXDomainer.apply(this);
    }

    public _updateYDomainer() {
      return AbstractBarPlot.prototype._updateYDomainer.apply(this);
    }
  }
}
}
