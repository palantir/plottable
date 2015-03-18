module Plottable {
export module Plot {
  export class ErrorBar<X> extends AbstractXYPlot<X,number> {

    protected _isVertical: boolean;
    private _defaultStrokeColor: string;

    /**
     * Constructs an ErrorBarPlot.
     *
     * Error bar plots are used to show variability in a reported measurement on a plot.
     * They are intended to be merged on top of other sorts of plots.
     *
     * @constructor
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractQuantitative<X>, yScale: Scale.AbstractQuantitative<number>, isVertical = true) {
      super(xScale, yScale);
      this.classed("error-plot", true);
      this._defaultStrokeColor = new Scale.Color().range()[1];
      this._isVertical = isVertical;
    }

    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      super.project(attrToSet, accessor, scale);
      return this;
    }

    protected _getDrawer(key: string) {
      return new Plottable._Drawer.ErrorBar(key, this._isVertical);
    }

  	protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      var xFunction = attrToProjector["x"];
      var yFunction = attrToProjector["y"];

      attrToProjector["stroke"] = attrToProjector["stroke"] || d3.functor(this._defaultStrokeColor);
      attrToProjector["stroke-width"] = attrToProjector["stroke-width"] || d3.functor("2px");

      return attrToProjector;
    }
  }
}
}
