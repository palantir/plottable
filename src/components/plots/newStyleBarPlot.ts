///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class NewStyleBarPlot extends NewStylePlot {
    public static _barAlignmentToFactor: {[alignment: string]: number} = {};
    public static DEFAULT_WIDTH = 10;
    public _baseline: D3.Selection;
    public _baselineValue = 0;
    public _barAlignmentFactor = 0;
    public _isVertical: boolean;

    public _animators: Animator.IPlotAnimatorMap = {
      "bars-reset" : new Animator.Null(),
      "bars"       : new Animator.IterativeDelay(),
      "baseline"   : new Animator.Null()
    };

    /**
     * Creates an NewStyleBarPlot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(xScale, yScale);
      this.classed("bar-plot", true);
      this.project("fill", () => Core.Colors.INDIGO);
      // super() doesn't set baseline
      this.baseline(this._baselineValue);
    }

    public _getDrawer(key: string) {
      return new Plottable._Drawer.Rect(key);
    }

    public _setup() {
      super._setup();
      this._baseline = this.renderArea.append("line").classed("baseline", true);
    }

    public _paint() {
      super._paint();

      var primaryScale = this._isVertical ? this.yScale : this.xScale;
      var scaledBaseline = primaryScale.scale(this._baselineValue);
      var baselineAttr: IAttributeToProjector = {
        "x1": this._isVertical ? 0 : scaledBaseline,
        "y1": this._isVertical ? scaledBaseline : 0,
        "x2": this._isVertical ? this.availableWidth : scaledBaseline,
        "y2": this._isVertical ? scaledBaseline : this.availableHeight
      };
      this._applyAnimatedAttributes(this._baseline, "baseline", baselineAttr);
    }

    /**
     * Sets the baseline for the bars to the specified value.
     *
     * @param {number} value The value to position the baseline at.
     * @return {NewStyleBarPlot} The calling NewStyleBarPlot.
     */
    public baseline(value: number) {
      return Abstract.BarPlot.prototype.baseline.apply(this, [value]);
    }

    public _updateDomainer(scale: Scale) {
      return Abstract.BarPlot.prototype._updateDomainer.apply(this, [scale]);
    }

    public _generateAttrToProjector(): IAttributeToProjector {
      return Abstract.BarPlot.prototype._generateAttrToProjector.apply(this);
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
