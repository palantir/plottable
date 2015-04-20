///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
export module Pan {
  export class AbstractPan extends AbstractInteraction {

    protected _xScale: Scale.AbstractQuantitative<any>;
    protected _yScale: Scale.AbstractQuantitative<any>;

    /**
     * Creates a PanZoomInteraction.
     *
     * The allows you to move around and zoom in on a plot, interactively. It
     * does so by changing the xScale and yScales' domains repeatedly.
     *
     * @constructor
     * @param {QuantitativeScale} [xScale] The X scale to update on panning/zooming.
     * @param {QuantitativeScale} [yScale] The Y scale to update on panning/zooming.
     */
    constructor(xScale?: Scale.AbstractQuantitative<any>, yScale?: Scale.AbstractQuantitative<any>) {
      super();
      this._xScale = xScale;
      this._yScale = yScale;
    }

  }
}
}
}
