///<reference path="reference.ts" />

module Plottable {
  export class BarRenderer extends NumericXYRenderer {
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
    constructor(dataset: any,
                xScale: QuantitiveScale,
                yScale: QuantitiveScale,
                xAccessor?: IAccessor,
                dxAccessor?: IAccessor,
                yAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("bar-renderer", true);
      this.project("dx", "dx");
    }

    public autorange() {
      super.autorange();
      var xA  = this._getAppliedAccessor(this._xAccessor);
      var dxA = this._getAppliedAccessor(this.dxAccessor);
      var x2Accessor = (d: any) => xA(d, null) + dxA(d, null);
      var x2Extent: number[] = d3.extent(this._dataSource.data(), x2Accessor);
      this.xScale.widenDomain(x2Extent);
      return this;
    }

    public _paint() {
      super._paint();
      var yRange = this.yScale.range();
      var maxScaledY = Math.max(yRange[0], yRange[1]);

      this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
      var xdr = this.xScale.domain()[1] - this.xScale.domain()[0];
      var xrr = this.xScale.range()[1] - this.xScale.range()[0];
      this.dataSelection.enter().append("rect");

      var attrToProjector = this._generateAttrToProjector();

      var xF = attrToProjector["x"];
      attrToProjector["x"] = (d: any, i: number) => xF(d, i) + this.barPaddingPx;

      var dxA = this._getAppliedAccessor(this._projectors["dx"].accessor);
      attrToProjector["width"] = (d: any, i: number) => {
        var dx = dxA(d, i);
        var scaledDx = this.xScale.scale(dx);
        var scaledOffset = this.xScale.scale(0);
        return scaledDx - scaledOffset - 2 * this.barPaddingPx;
      };

      attrToProjector["height"] = (d: any, i: number) => {
        return maxScaledY - attrToProjector["y"](d, i);
      };

      this.dataSelection.attr(attrToProjector);
      this.dataSelection.exit().remove();
    }
  }
}
