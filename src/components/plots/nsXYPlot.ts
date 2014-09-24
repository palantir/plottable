///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class NSXYPlot<X,Y> extends NSPlot {
    public _xScale: Abstract.Scale<X, number>;
    public _yScale: Abstract.Scale<Y, number>;
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
    constructor(xScale: Abstract.Scale<X, number>, yScale: Abstract.Scale<Y, number>) {
      super();
      if (xScale == null || yScale == null) {throw new Error("XYPlots require an xScale and yScale");}
      this.classed("xy-plot", true);

      this.project("x", "x", xScale); // default accessor
      this.project("y", "y", yScale); // default accessor
    }

    /**
     * @param {string} attrToSet One of ["x", "y"] which determines the point's
     * x and y position in the Plot.
     */
    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale<any, any>) {
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
      if (this._xScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale<any>> this._xScale;
        if (!scale._userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }

    public _updateYDomainer() {
      if (this._yScale instanceof QuantitativeScale) {
        var scale = <QuantitativeScale<any>> this._yScale;
        if (!scale._userSetDomainer) {
          scale.domainer().pad().nice();
        }
      }
    }
  }
}
}
