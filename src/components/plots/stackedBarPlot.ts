///<reference path="../../reference.ts" />

module Plottable {
export module Plot {

  export class StackedBar extends Abstract.Stacked {
    public _baselineValue = 0;
    public _baseline: D3.Selection;
    public _barAlignmentFactor = 0.5;

    /**
     * Constructs a StackedBar plot.
     *
     * @constructor
     * @param {Scale} xScale the x scale of the plot
     * @param {Scale} yScale the y scale of the plot
     * @param {boolean} isVertical if the plot if vertical
     */
    constructor(xScale?: Abstract.Scale<any,number>, yScale?: Abstract.Scale<any,number>, isVertical = true) {
      super(xScale, yScale);
      this.classed("bar-plot", true);
      this.project("fill", () => Core.Colors.INDIGO);
      // super() doesn't set baseline
      this.baseline(this._baselineValue);
      this._isVertical = isVertical;
    }

    public _getDrawer(key: string) {
      return Abstract.NewStyleBarPlot.prototype._getDrawer.apply(this, [key]);
    }

    public _generateAttrToProjector() {
      var attrToProjector = Abstract.NewStyleBarPlot.prototype._generateAttrToProjector.apply(this);

      var primaryAttr = this._isVertical ? "y" : "x";
      var primaryScale = this._isVertical ? this.yScale : this.xScale;
      var getStart = (d: any) => primaryScale.scale(d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);
      var getEnd = (d: any) => primaryScale.scale(d[primaryAttr] + d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]);

      var heightF = (d: any) => Math.abs(getEnd(d) - getStart(d));
      var widthF = attrToProjector["width"];
      attrToProjector["height"] = this._isVertical ? heightF : widthF;
      attrToProjector["width"] = this._isVertical ? widthF : heightF;

      attrToProjector[primaryAttr] = this._isVertical ? getEnd : (d: any) => getEnd(d) - heightF(d);

      return attrToProjector;
    }

    public baseline(value: number) {
      return Abstract.NewStyleBarPlot.prototype.baseline.apply(this, [value]);
    }

    public _updateDomainer(scale: Abstract.Scale<any,number>) {
      return Abstract.NewStyleBarPlot.prototype._updateDomainer.apply(this, [scale]);
    }

    public _updateXDomainer() {
      return Abstract.NewStyleBarPlot.prototype._updateXDomainer.apply(this);
    }

    public _updateYDomainer() {
      return Abstract.NewStyleBarPlot.prototype._updateYDomainer.apply(this);
    }
  }
}
}
