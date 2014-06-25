///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class HorizontalBar extends Abstract.BarPlot {
    public static _BarAlignmentToFactor: {[alignment: string]: number} = {"top": 0, "center": 0.5, "bottom": 1};
    public isVertical = false;
    /**
     * Creates a HorizontalBarPlot.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.QuantitiveScale, yScale: Abstract.Scale) {
      super(dataset, xScale, yScale);
    }


    public _updateXDomainer() {
      this._updateDomainer(this.xScale);
      return this;
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      // by convention, for API users the 2ndary dimension of a bar is always called its "width", so
      // the "width" of a horziontal bar plot is actually its "height" from the perspective of a svg rect
      var widthF = attrToProjector["width"];
      attrToProjector["width"] = attrToProjector["height"];
      attrToProjector["height"] = widthF;
      return attrToProjector;
    }
  }
}
}
