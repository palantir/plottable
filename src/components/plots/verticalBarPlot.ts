///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /**
   * A VerticalBarPlot draws bars vertically.
   * Key projected attributes:
   *  - "width" - the horizontal width of a bar.
   *      - if an ordinal scale is attached, this defaults to ordinalScale.rangeBand()
   *      - if a quantitative scale is attached, this defaults to 10
   *  - "x" - the horizontal position of a bar
   *  - "y" - the vertical height of a bar
   */
  export class VerticalBar<X> extends Bar<X,number> {
    protected static _BarAlignmentToFactor: {[alignment: string]: number} = {"left": 0, "center": 0.5, "right": 1};

    private static WARNED = false;

    /**
     * Constructs a VerticalBarPlot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractQuantitative<number>) {
      this._isVertical = true;
      super(xScale, yScale, true);
      if (!VerticalBar.WARNED) {
        VerticalBar.WARNED = true;
        _Util.Methods.warn("Plottable.Plot.VerticalBar is deprecated. Please use Plottable.Plot.Bar with isVertical = true.");
      }
    }

    protected _updateYDomainer() {
      this._updateDomainer(this._yScale);
    }
  }
}
}
