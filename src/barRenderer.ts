///<reference path="reference.ts" />

module Plottable {
  export class BarRenderer extends XYRenderer {
    private static defaultDxAccessor = "dx";
    public barPaddingPx = 1;

    public dxAccessor: any;

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
    }

    public autorange() {
      super.autorange();
      var xA  = this._getAppliedAccessor(this._xAccessor);
      var dxA = this._getAppliedAccessor(this.dxAccessor);
      var x2Accessor = (d: any) => xA(d, null) + dxA(d, null);
      var x2Extent: number[] = d3.extent(this._data, x2Accessor);
      this.xScale.widenDomain(x2Extent);
      return this;
    }

    public _paint() {
      super._paint();
      var yRange = this.yScale.range();
      var maxScaledY = Math.max(yRange[0], yRange[1]);

      this.dataSelection = this.renderArea.selectAll("rect").data(this._data);
      var xdr = this.xScale.domain()[1] - this.xScale.domain()[0];
      var xrr = this.xScale.range()[1] - this.xScale.range()[0];
      this.dataSelection.enter().append("rect");

      var xA = this._getAppliedAccessor(this._xAccessor);
      var xFunction = (d: any, i: number) => {
        var x = xA(d, i);
        var scaledX = this.xScale.scale(x);
        return scaledX + this.barPaddingPx;
      };

      var yA = this._getAppliedAccessor(this._yAccessor);
      var yFunction = (d: any, i: number) => {
        var y = yA(d, i);
        var scaledY = this.yScale.scale(y);
        return scaledY;
      };

      var dxA = this._getAppliedAccessor(this.dxAccessor);
      var widthFunction = (d: any, i: number) => {
        var dx = dxA(d, i);
        var scaledDx = this.xScale.scale(dx);
        var scaledOffset = this.xScale.scale(0);
        return scaledDx - scaledOffset - 2 * this.barPaddingPx;
      };

      var heightFunction = (d: any, i: number) => {
        return maxScaledY - yFunction(d, i);
      };

      this.dataSelection
            .attr("x", xFunction)
            .attr("y", yFunction)
            .attr("width", widthFunction)
            .attr("height", heightFunction)
            .attr("fill", this._getAppliedAccessor(this._colorAccessor));
      this.dataSelection.exit().remove();
    }
  }
}
