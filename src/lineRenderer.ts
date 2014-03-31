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
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
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
      var xA = this._getAppliedAccessor(this._xAccessor);
      var yA = this._getAppliedAccessor(this._yAccessor);
      var cA = this._getAppliedAccessor(this._colorAccessor);
      this.line = d3.svg.line()
            .x((d: any, i: number) => this.xScale.scale(xA(d, i)))
            .y((d: any, i: number) => this.yScale.scale(yA(d, i)));
      this.dataSelection = this.path.datum(this._data);
      this.path.attr("d", this.line).attr("stroke", cA);
    }
  }
}
