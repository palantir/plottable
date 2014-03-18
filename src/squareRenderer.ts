///<reference path="reference.ts" />

module Plottable {
  export class SquareRenderer extends XYRenderer {
    private rAccessor: IAccessor;
    private static defaultRAccessor = (d: any) => 3;

    /**
     * Creates a SquareRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     * @param {IAccessor} [rAccessor] A function for extracting radius values from the data.
     */
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale,
                xAccessor?: IAccessor, yAccessor?: IAccessor, rAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.rAccessor = (rAccessor != null) ? rAccessor : SquareRenderer.defaultRAccessor;
      this.classed("square-renderer", true);
    }

    public _paint() {
      super._paint();
      var xFn = (d: any, i: number) =>
        this.xScale.scale(this.xAccessor(d, i, this._metadata)) - this.rAccessor(d, i, this._metadata);

      var yFn = (d: any, i: number) =>
        this.yScale.scale(this.yAccessor(d, i, this._metadata)) - this.rAccessor(d, i, this._metadata);

      this.dataSelection = this.renderArea.selectAll("rect").data(this._data);
      this.dataSelection.enter().append("rect");
      this.dataSelection.attr("x", xFn)
                        .attr("y", yFn)
                        .attr("width",  (d: any, i: number) => this.rAccessor(d, i, this._metadata))
                        .attr("height", (d: any, i: number) => this.rAccessor(d, i, this._metadata))
                        .attr("fill", (d: any, i: number) => this._colorAccessor(d, i, this._metadata));
      this.dataSelection.exit().remove();
    }
  }
}
