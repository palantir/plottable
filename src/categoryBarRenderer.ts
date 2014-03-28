///<reference path="reference.ts" />

module Plottable {
  export class CategoryBarRenderer extends CategoryRenderer {
    private _widthAccessor: any;

    /**
     * Creates a CategoryBarRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {OrdinalScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting the start position of each bar from the data.
     * @param {IAccessor} [widthAccessor] A function for extracting the width position of each bar, in pixels, from the data.
     * @param {IAccessor} [yAccessor] A function for extracting height of each bar from the data.
     */
    constructor(dataset: IDataset,
            xScale: OrdinalScale,
            yScale: QuantitiveScale,
            xAccessor?: IAccessor,
            widthAccessor?: IAccessor,
            yAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("bar-renderer", true);
      this._widthAccessor = (widthAccessor != null) ? widthAccessor : 10; // default width is 10px
    }

    /**
     * Sets the width accessor.
     *
     * @param {any} accessor The new width accessor.
     * @returns {CategoryBarRenderer} The calling CategoryBarRenderer.
     */
    public widthAccessor(accessor: any) {
      this._widthAccessor = accessor;
      this._requireRerender = true;
      this._rerenderUpdateSelection = true;
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

      var widthFunction = this._getAppliedAccessor(this._widthAccessor);

      var xA = this._getAppliedAccessor(this._xAccessor);
      var xFunction = (d: any, i: number) => {
        var x = xA(d, i);
        var scaledX = this.xScale.scale(x);
        return scaledX - widthFunction(d, i)/2;
      };

      var yA = this._getAppliedAccessor(this._yAccessor);
      var yFunction = (d: any, i: number) => {
        var y = yA(d, i);
        var scaledY = this.yScale.scale(y);
        return scaledY;
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
