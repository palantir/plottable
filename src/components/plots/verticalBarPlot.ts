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
     * @param {QuantitiveScale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.QuantitiveScale) {
      super(dataset, xScale, yScale);
    }

    public _updateYDomainer() {
      if (this.yScale instanceof Abstract.QuantitiveScale) {
        var scale = <Abstract.QuantitiveScale> this.yScale;
        if (!scale._userSetDomainer) {
          scale.domainer().paddingException(this._baselineValue);
        }
      }
      return this;
    }

  }
}
}
