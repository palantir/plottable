///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class XYPlot extends Plot {
    public xScale: Abstract.Scale;
    public yScale: Abstract.Scale;
    /**
     * Creates an XYPlot.
     *
     * An XYPlot is a plot from drawing 2-dimensional data. Common examples
     * include Scale.Line and Scale.Bar.
     *
     * @constructor
     * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(dataset);
      if (xScale == null || yScale == null) {throw new Error("XYPlots require an xScale and yScale");}
      this.classed("xy-plot", true);

      this.project("x", "x", xScale); // default accessor
      this.project("y", "y", yScale); // default accessor
    }

    /**
     * @param {string} attrToSet One of ["x", "y"] which determines the point's
     * x and y position in the Plot.
     */
    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale) {
      // We only want padding and nice-ing on scales that will correspond to axes / pixel layout.
      // So when we get an "x" or "y" scale, enable autoNiceing and autoPadding.
      if (attrToSet === "x" && scale != null) {
        this.xScale = scale;
        this._updateXDomainer();
      }

      if (attrToSet === "y" && scale != null) {
        this.yScale = scale;
        this._updateYDomainer();
      }

      super.project(attrToSet, accessor, scale);

      return this;
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this.xScale.range([0, this.availableWidth]);
      this.yScale.range([this.availableHeight, 0]);
    }

    public _updateXDomainer() {
      if (this.xScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale> this.xScale;
        if (!scale._userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }

    public _updateYDomainer() {
      if (this.yScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale> this.yScale;
        if (!scale._userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }
  }
}
}
