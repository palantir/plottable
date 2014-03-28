///<reference path="reference.ts" />

module Plottable {
  export class CategoryBarRenderer extends CategoryRenderer {
    private _barWidth = 10;

    /**
     * Creates a CategoryBarRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {OrdinalScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting the start position of each bar from the data.
     * @param {number} [barWidth] The width of each bar, in pixels.
     * @param {IAccessor} [yAccessor] A function for extracting height of each bar from the data.
     */
    constructor(dataset: IDataset,
            xScale: OrdinalScale,
            yScale: QuantitiveScale,
            xAccessor?: IAccessor,
            barWidth?: number,
            yAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed("bar-renderer", true);
      if (barWidth != null) {
        this._barWidth = barWidth;
      }
    }

    /**
     * Retrieves the current bar width, or sets a new bar width.
     *
     * @param {number} [value] The new value for the bar width, in pixels.
     * @returns {number|CategoryBarRenderer} The current bar width, or the calling CategoryBarRenderer.
     */
    public barWidth(): number;
    public barWidth(value: number): CategoryBarRenderer;
    public barWidth(value?: number): any {
      if (value == null) {
        return this._barWidth;
      } else {
        this._barWidth = value;
        return this;
      }
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
        return scaledX - this._barWidth/2;
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
            .attr("width", this._barWidth)
            .attr("height", heightFunction)
            .attr("fill", this._getAppliedAccessor(this._colorAccessor));
      this.dataSelection.exit().remove();
    }
  }
}
