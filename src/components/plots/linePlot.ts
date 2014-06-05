///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Line extends Area {
    private path: D3.Selection;
    public _ANIMATION_DURATION = 600; //milliseconds

    /**
     * Creates a LinePlot.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(dataset, xScale, yScale);
      this.classed("line-renderer", true);
      this.project("stroke", () => "steelblue");
      this.project("fill", () => "none");
    }
  }
}
}
