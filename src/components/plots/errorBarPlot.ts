module Plottable {
export module Plot {
  export class ErrorBar<X, Y> extends AbstractXYPlot<X, Y> {

    private _isVertical: boolean;
    private _defaultStrokeColor: string;
    private _tickLength = 20;

    /**
     * Constructs an ErrorBarPlot.
     *
     * Error bar plots are used to show variability in a reported measurement on a plot.
     * They are intended to be merged on top of other sorts of plots.
     *
     * @constructor
     * @param {AbstractScale} xScale The x scale to use.
     * @param {AbstractScale} yScale The y scale to use.
     * @param {boolean} isVertical Whether the plot is vertical or not. Defaults to true.
     */
    constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>, isVertical = true) {
      super(xScale, yScale);
      this.classed("error-plot", true);
      this._defaultStrokeColor = new Scale.Color().range()[1];
      this._isVertical = isVertical;
    }

    /**
     * Retrieves the length of error bar ticks in pixels. Defaults to 20px in length.
     *
     * @return {number} Length of error bar ticks
     */
    public tickLength(): number;
    /**
     * Sets the length of error bar ticks.
     *
     * @param {number} length Length of error bar ticks in pixels.
     * @return {Plot.ErrorBar} The calling Plot.ErrorBar
     */
    public tickLength(length: number): ErrorBar<X, Y>;
    public tickLength(length?: number): any {
      if (length == null) {
        return this._tickLength;
      }
      this._tickLength = length;
      return this;
    }

    protected _getDrawer(key: string) {
      return new Plottable._Drawer.ErrorBar(key, this._isVertical).tickLength(this._tickLength);
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
