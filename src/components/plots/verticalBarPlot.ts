///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class VerticalBar extends Abstract.BarPlot {
    public static _BarAlignmentToFactor: {[alignment: string]: number} = {"left": 0, "center": 0.5, "right": 1};
    public _isVertical = true;
    /**
     * Creates a VerticalBarPlot.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.QuantitativeScale) {
      super(dataset, xScale, yScale);
    }
  }
}
}
