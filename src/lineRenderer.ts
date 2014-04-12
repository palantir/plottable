///<reference path="reference.ts" />

module Plottable {
  export class LineRenderer extends NumericXYRenderer {
    private path: D3.Selection;
    private line: D3.Svg.Line;

/**
     * Creates a LineRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     */
    constructor(dataset: any, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("line-renderer", true);
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
