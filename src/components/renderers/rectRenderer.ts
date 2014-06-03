///<reference path="../../reference.ts" />

module Plottable {
  export class RectRenderer extends XYRenderer {
    /**
     * Creates a RectRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Scale, yScale: Scale) {
      super(dataset, xScale, yScale);
      this.classed("rect-renderer", true);
      this.project("width" , 4); // default
      this.project("height", 4); // default
      this.project("fill", () => "steelblue");
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      var xF = attrToProjector["x"];
      var yF = attrToProjector["y"];
      var widthF = attrToProjector["width"];
      var heightF = attrToProjector["height"];
      attrToProjector["x"] = (d: any, i: number) => xF(d, i) -  widthF(d, i) / 2;
      attrToProjector["y"] = (d: any, i: number) => yF(d, i) - heightF(d, i) / 2;

      var rects = this.renderArea.selectAll("rect").data(this._dataSource.data());
      rects.enter().append("rect");
      rects.attr(attrToProjector);
      rects.exit().remove();
    }
  }
}
