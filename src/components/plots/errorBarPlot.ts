module Plottable {
export module Plot {
  export class ErrorBar<X> extends AbstractXYPlot<X,number> {

    private _isVertical: boolean;
    private _defaultStrokeColor: string;

    /**
     * Constructs an ErrorBarPlot.
     *
     * Error bar plots are used to show variability in a reported measurement on a plot.
     * They are intended to be merged on top of other sorts of plots.
     *
     * @constructor
     * @param {AbstractScale} xScale The x scale to use.
     * @param {AbstractScale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<X, number>, isVertical = true) {
      super(xScale, yScale);
      this.classed("error-plot", true);
      this._defaultStrokeColor = new Scale.Color().range()[1];
      this._isVertical = isVertical;
    }

    protected _getDrawer(key: string) {
      return new Plottable._Drawer.ErrorBar(key, this._isVertical);
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      attrToProjector["stroke"] = attrToProjector["stroke"] || d3.functor(this._defaultStrokeColor);
      attrToProjector["stroke-width"] = attrToProjector["stroke-width"] || d3.functor("2px");

      return attrToProjector;
    }
  }
}
}
