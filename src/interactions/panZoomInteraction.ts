///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class PanZoom extends Abstract.Interaction {
    private zoom: D3.Behavior.Zoom;
    public _xScale: Abstract.QuantitativeScale<any>;
    public _yScale: Abstract.QuantitativeScale<any>;

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
    constructor(xScale?: Abstract.QuantitativeScale<any>, yScale?: Abstract.QuantitativeScale<any>) {
      super();
      if (xScale == null) {
        xScale = new Plottable.Scale.Linear();
      }
      if (yScale == null) {
        yScale = new Plottable.Scale.Linear();
      }
      this._xScale = xScale;
      this._yScale = yScale;
      this.zoom = d3.behavior.zoom();
      this.zoom.x(this._xScale._d3Scale);
      this.zoom.y(this._yScale._d3Scale);
      this.zoom.on("zoom", () => this.rerenderZoomed());
    }

    /**
     * Sets the scales back to their original domains.
     */
    public resetZoom() {
      // HACKHACK #254
      this.zoom = d3.behavior.zoom();
      this.zoom.x(this._xScale._d3Scale);
      this.zoom.y(this._yScale._d3Scale);
      this.zoom.on("zoom", () => this.rerenderZoomed());
      this.zoom(this._hitBox);
    }

    public _anchor(component: Abstract.Component, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      this.zoom(hitBox);
    }

    private rerenderZoomed() {
      // HACKHACK since the d3.zoom.x modifies d3 scales and not our TS scales, and the TS scales have the
      // event listener machinery, let's grab the domain out of the d3 scale and pipe it back into the TS scale
      var xDomain = this._xScale._d3Scale.domain();
      var yDomain = this._yScale._d3Scale.domain();
      this._xScale.domain(xDomain);
      this._yScale.domain(yDomain);
    }
  }
}
}
