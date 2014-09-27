///<reference path="../../reference.ts" />

module Plottable {
export module Plot {

  export class StackedBar<X,Y> extends Abstract.Stacked<X, Y> {
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
    constructor(xScale?: Abstract.Scale<X,number>, yScale?: Abstract.Scale<Y,number>, isVertical = true) {
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
      Abstract.BarPlot.prototype._setup.call(this);
    }

    public _getAnimator(drawer: Abstract._Drawer, index: number) {
      var animator = new Animator.Rect();
      animator.delay(animator.duration() * index);
      return animator;
    }

    public _getDrawer(key: string) {
      return Abstract.BarPlot.prototype._getDrawer.apply(this, [key]);
    }

    public _generateAttrToProjector() {
      var attrToProjector = Abstract.BarPlot.prototype._generateAttrToProjector.apply(this);

      var primaryAttr = this._isVertical ? "y" : "x";
      var primaryScale: Abstract.Scale<any,number> = this._isVertical ? this._yScale : this._xScale;
      var primaryAccessor = this._projectors[primaryAttr].accessor;
      var getStart = (d: any) => primaryScale.scale(d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
      var getEnd = (d: any) => primaryScale.scale(primaryAccessor(d) + d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);

      var heightF = (d: any) => Math.abs(getEnd(d) - getStart(d));
      var widthF = attrToProjector["width"];
      attrToProjector["height"] = this._isVertical ? heightF : widthF;
      attrToProjector["width"] = this._isVertical ? widthF : heightF;

      var attrFunction = (d: any) => primaryAccessor(d) < 0 ? getStart(d) : getEnd(d);
      attrToProjector[primaryAttr] = (d: any) => this._isVertical ? attrFunction(d) : attrFunction(d) - heightF(d);
      return attrToProjector;
    }

    public _paint() {
      super._paint();
      var primaryScale: Abstract.Scale<any,number> = this._isVertical ? this._yScale : this._xScale;
      var scaledBaseline = primaryScale.scale(this._baselineValue);
      var baselineAttr: any = {
        "x1": this._isVertical ? 0 : scaledBaseline,
        "y1": this._isVertical ? scaledBaseline : 0,
        "x2": this._isVertical ? this.width() : scaledBaseline,
        "y2": this._isVertical ? scaledBaseline : this.height()
      };
      this._baseline.attr(baselineAttr);
    }

    public baseline(value: number) {
      return Abstract.BarPlot.prototype.baseline.apply(this, [value]);
    }

    public _updateDomainer(scale: Abstract.Scale<any,number>) {
      return Abstract.BarPlot.prototype._updateDomainer.apply(this, [scale]);
    }

    public _updateXDomainer() {
      return Abstract.BarPlot.prototype._updateXDomainer.apply(this);
    }

    public _updateYDomainer() {
      return Abstract.BarPlot.prototype._updateYDomainer.apply(this);
    }
  }
}
}
