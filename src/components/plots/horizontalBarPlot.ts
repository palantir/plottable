///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /**
   * A HorizontalBarPlot draws bars horizontally.
   * Key projected attributes:
   *  - "width" - the vertical height of a bar (since the bar is rotated horizontally)
   *      - if an ordinal scale is attached, this defaults to ordinalScale.rangeBand()
   *      - if a quantitative scale is attached, this defaults to 10
   *  - "x" - the horizontal length of a bar
   *  - "y" - the vertical position of a bar
   */
  export class HorizontalBar<Y> extends Bar<number,Y> {
    protected static _BarAlignmentToFactor: {[alignment: string]: number} = {"top": 0, "center": 0.5, "bottom": 1};

    private static WARNED = false;

    /**
     * Constructs a HorizontalBarPlot.
     *
     * @constructor
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractQuantitative<number>, yScale: Scale.AbstractScale<Y,number>) {
      super(xScale, yScale, false);
      if (!HorizontalBar.WARNED) {
        HorizontalBar.WARNED = true;
        _Util.Methods.warn("Plottable.Plot.HorizontalBar is deprecated. Please use Plottable.Plot.Bar with isVertical = false.");
      }
    }

    protected _updateXDomainer() {
      this._updateDomainer(this._xScale);
    }
  }
}
}
