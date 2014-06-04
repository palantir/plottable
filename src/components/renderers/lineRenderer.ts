///<reference path="../../reference.ts" />

module Plottable {
  export class LineRenderer extends AreaRenderer {
    private path: D3.Selection;
    public _ANIMATION_DURATION = 600; //milliseconds

    /**
     * Creates a LineRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Scale, yScale: Scale) {
      super(dataset, xScale, yScale);
      this.classed("line-renderer", true);
      this.project("stroke", () => "steelblue");
      this.project("fill", () => "none");
    }
  }
}
