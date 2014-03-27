///<reference path="reference.ts" />

module Plottable {
  export class BarRenderer extends XYRenderer {
    private static defaultDxAccessor = (d: any) => d.dx;
    public barPaddingPx = 1;

    public dxAccessor: IAccessor;

    /**
     * Creates a BarRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting the start position of each bar from the data.
     * @param {IAccessor} [dxAccessor] A function for extracting the width of each bar from the data.
     * @param {IAccessor} [yAccessor] A function for extracting height of each bar from the data.
     */
    constructor(dataset: IDataset,
                xScale: QuantitiveScale,
                yScale: QuantitiveScale,
                xAccessor?: IAccessor,
                dxAccessor?: IAccessor,
                yAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("bar-renderer", true);

      this.dxAccessor = (dxAccessor != null) ? dxAccessor : BarRenderer.defaultDxAccessor;


      var x2Accessor = (d: any) => this.xAccessor(d, null, this._metadata) + this.dxAccessor(d, null, this._metadata);
      var x2Extent = d3.extent(dataset.data, x2Accessor);
      this.xScale.widenDomain(x2Extent);
    }

    public _paint() {
      super._paint();
      var yRange = this.yScale.range();
      var maxScaledY = Math.max(yRange[0], yRange[1]);

      this.dataSelection = this.renderArea.selectAll("rect").data(this._data);
      var xdr = this.xScale.domain()[1] - this.xScale.domain()[0];
      var xrr = this.xScale.range()[1] - this.xScale.range()[0];
      this.dataSelection.enter().append("rect");

      var widthFunction = (d: any, i: number) => {
        var dx = this.dxAccessor(d, i, this._metadata);
        var scaledDx = this.xScale.scale(dx);
        var scaledOffset = this.xScale.scale(0);
        return scaledDx - scaledOffset - 2 * this.barPaddingPx;
      };

      var xFunction = (d: any, i: number) => {
        var x = this.xAccessor(d, i, this._metadata);
        var scaledX = this.xScale.scale(x);
        return scaledX - widthFunction(d, i)/2;
      };

      var yFunction = (d: any, i: number) => {
        var y = this.yAccessor(d, i, this._metadata);
        var scaledY = this.yScale.scale(y);
        return scaledY;
      };

      var heightFunction = (d: any, i: number) => {
        var y = this.yAccessor(d, i, this._metadata);
        var scaledY = this.yScale.scale(y);
        return maxScaledY - scaledY;
      };

      var colorFunction = (d: any, i: number) => {
        return this._colorAccessor(d, i, this._metadata);
      };

      this.dataSelection
            .attr("x", xFunction)
            .attr("y", yFunction)
            .attr("width", widthFunction)
            .attr("height", heightFunction)
            .attr("fill", colorFunction);
      this.dataSelection.exit().remove();
    }
  }
}
