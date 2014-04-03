///<reference path="reference.ts" />

module Plottable {
  export class SquareRenderer extends NumericXYRenderer {
    private _rAccessor: any;
    private static defaultRAccessor = 3;

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
    constructor(dataset: any, xScale: QuantitiveScale, yScale: QuantitiveScale,
                xAccessor?: IAccessor, yAccessor?: IAccessor, rAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this._rAccessor = (rAccessor != null) ? rAccessor : SquareRenderer.defaultRAccessor;
      this.classed("square-renderer", true);
    }


    public rAccessor(a: any) {
      this._rAccessor = a;
      this._requireRerender = true;
      this._rerenderUpdateSelection = true;
      return this;
    }

    public _paint() {
      super._paint();
      var xA = this._getAppliedAccessor(this._xAccessor);
      var yA = this._getAppliedAccessor(this._yAccessor);
      var rA = this._getAppliedAccessor(this._rAccessor);
      var cA = this._getAppliedAccessor(this._colorAccessor);
      var xFn = (d: any, i: number) =>
        this.xScale.scale(xA(d, i)) - rA(d, i);

      var yFn = (d: any, i: number) =>
        this.yScale.scale(yA(d, i)) - rA(d, i);

      this.dataSelection = this.renderArea.selectAll("rect").data(this._data);
      this.dataSelection.enter().append("rect");
      this.dataSelection.attr("x", xFn)
                        .attr("y", yFn)
                        .attr("width",  rA)
                        .attr("height", rA)
                        .attr("fill", cA);
      this.dataSelection.exit().remove();
    }
  }
}
