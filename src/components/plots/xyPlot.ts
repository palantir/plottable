///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class XYPlot extends Plot {
<<<<<<< HEAD
    public _xScale: Abstract.Scale;
    public _yScale: Abstract.Scale;
=======
    public xScale: Abstract.Scale<any, number>;
    public yScale: Abstract.Scale<any, number>;
    // TODO - replace any typing
>>>>>>> api-breaking-changes
    /**
     * Constructs an XYPlot.
     *
     * An XYPlot is a plot from drawing 2-dimensional data. Common examples
     * include Scale.Line and Scale.Bar.
     *
     * @constructor
     * @param {any[]|Dataset} [dataset] The data or Dataset to be associated with this Renderer.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale<any, number>, yScale: Abstract.Scale<any, number>) {
      super(dataset);
      if (xScale == null || yScale == null) {throw new Error("XYPlots require an xScale and yScale");}
      this.classed("xy-plot", true);

      this.project("x", "x", xScale); // default accessor
      this.project("y", "y", yScale); // default accessor
    }

<<<<<<< HEAD
    /**
     * @param {string} attrToSet One of ["x", "y"] which determines the point's
     * x and y position in the Plot.
     */
    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale) {
=======
    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale<any, any>) {
>>>>>>> api-breaking-changes
      // We only want padding and nice-ing on scales that will correspond to axes / pixel layout.
      // So when we get an "x" or "y" scale, enable autoNiceing and autoPadding.
      if (attrToSet === "x" && scale != null) {
        this._xScale = scale;
        this._updateXDomainer();
      }

      if (attrToSet === "y" && scale != null) {
        this._yScale = scale;
        this._updateYDomainer();
      }

      super.project(attrToSet, accessor, scale);

      return this;
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this._xScale.range([0, this.width()]);
      this._yScale.range([this.height(), 0]);
    }

    public _updateXDomainer() {
<<<<<<< HEAD
      if (this._xScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale> this._xScale;
=======
      if (this.xScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale<any>> this.xScale;
>>>>>>> api-breaking-changes
        if (!scale._userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }

    public _updateYDomainer() {
<<<<<<< HEAD
      if (this._yScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale> this._yScale;
=======
      if (this.yScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale<any>> this.yScale;
>>>>>>> api-breaking-changes
        if (!scale._userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }
  }
}
}
