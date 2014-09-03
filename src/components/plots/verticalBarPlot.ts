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
  export class VerticalBar extends Abstract.BarPlot {
    public static _BarAlignmentToFactor: {[alignment: string]: number} = {"left": 0, "center": 0.5, "right": 1};
    public _isVertical = true;

    /**
     * Constructs a VerticalBarPlot.
     *
     * @constructor
     * @param {IDataset | any} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale<any, number>, yScale: Abstract.QuantitativeScale<number>) {
      super(dataset, xScale, yScale);
    }

    public _updateYDomainer() {
      this._updateDomainer(this._yScale);
    }
  }
}
}
