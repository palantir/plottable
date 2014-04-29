///<reference path="../../reference.ts" />

module Plottable {
  export class LineRenderer extends XYRenderer {
    private path: D3.Selection;
    private line: D3.Svg.Line;

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
    }

    public _anchor(element: D3.Selection) {
      super._anchor(element);
      this.path = this.renderArea.append("path").classed("line", true);
      return this;
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      this.line = d3.svg.line()
            .x(attrToProjector["x"])
            .y(attrToProjector["y"]);
      this.dataSelection = this.path.datum(this._dataSource.data());
      delete attrToProjector["x"];
      delete attrToProjector["y"];
      this.path.attr("d", this.line).attr(attrToProjector);
    }
  }
}
