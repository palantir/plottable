///<reference path="../../reference.ts" />

module Plottable {
  export class SquareRenderer extends XYRenderer {
    private _rAccessor: any;
    private static DEFAULT_R_ACCESSOR = 3;

    /**
     * Creates a SquareRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Scale, yScale: Scale) {
      super(dataset, xScale, yScale);
      this.classed("square-renderer", true);
      this.project("r", 3); // default
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      var xF = attrToProjector["x"];
      var yF = attrToProjector["y"];
      var rF = attrToProjector["r"];
      attrToProjector["x"] = (d: any, i: number) => xF(d, i) - rF(d, i);
      attrToProjector["y"] = (d: any, i: number) => yF(d, i) - rF(d, i);

      this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
      this.dataSelection.enter().append("rect");
      this.dataSelection.attr(attrToProjector);
      this.dataSelection.exit().remove();
    }
  }
}
