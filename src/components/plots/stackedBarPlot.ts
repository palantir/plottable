///<reference path="../../reference.ts" />

module Plottable {
export module Plot {

  export class StackedBar extends Abstract.Stacked {
    public _isVertical = true;
    public _baselineValue = 0;
    public _baseline: D3.Selection;

    constructor(xScale?: Abstract.Scale, yScale?: Abstract.Scale) {
      super(xScale, yScale);
      this.classed("bar-plot", true);
      this.project("fill", () => Core.Colors.INDIGO);
      // super() doesn't set baseline
      this.baseline(this._baselineValue);
    }

    public _generateAttrToProjector() {
      var attrToProjector = Abstract.NewStyleBarPlot.prototype._generateAttrToProjector.apply(this);
      var primaryScale    = this._isVertical ? this.yScale : this.xScale;
      var getY0 = (d: any) => primaryScale.scale(d.y0);
      var getY = (d: any) => primaryScale.scale(d.y + d.y0);
      attrToProjector["height"] = (d: any) => Math.abs(getY(d) - getY0(d));
      attrToProjector["y"] = (d: any) => getY(d);
      return attrToProjector;
    }

    public _getDrawer(key: string) {
      return Abstract.NewStyleBarPlot.prototype._getDrawer.apply(this, [key]);
    }

    public _paint() {
      var attrHash = this._generateAttrToProjector();
      var datasets = this._getDatasetsInOrder();
      this._getDrawersInOrder().forEach((d, i) => d.draw(datasets[i].data(), attrHash));
    }

    public baseline(value: number) {
      return Abstract.NewStyleBarPlot.prototype.baseline.apply(this, [value]);
    }

    public _updateDomainer(scale: Abstract.Scale) {
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
