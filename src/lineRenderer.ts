///<reference path="reference.ts" />

module Plottable {
  export class LineRenderer extends XYRenderer {
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
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("line-renderer", true);
    }

    public _anchor(element: D3.Selection) {
      super._anchor(element);
      this.path = this.renderArea.append("path");
      return this;
    }

    public _paint() {
      super._paint();
      this.line = d3.svg.line()
            .x((d: any, i: number) => this.xScale.scale(this.xAccessor(d, i, this._metadata)))
            .y((d: any, i: number) => this.yScale.scale(this.yAccessor(d, i, this._metadata)));
      this.dataSelection = this.path.classed("line", true)
        .datum(this._data);
      this.path.attr("d", this.line);
      // Since we can only set one stroke for the full line, call colorAccessor on first datum with index 0
      this.path.attr("stroke", this._colorAccessor(this._data[0], 0, this._metadata));
    }
  }
}
