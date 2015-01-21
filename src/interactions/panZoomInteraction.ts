///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class PanZoom extends AbstractInteraction {

    private _zoom: D3.Behavior.Zoom;
    private _xScale: Scale.AbstractQuantitative<any>;
    private _yScale: Scale.AbstractQuantitative<any>;

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
      if (xScale) {
        this._xScale = xScale;
        // HACKHACK #1388: self-register for resetZoom()
        this._xScale.broadcaster.registerListener("pziX" + this.getID(), () => this.resetZoom());
      }
      if (yScale) {
        this._yScale = yScale;
        // HACKHACK #1388: self-register for resetZoom()
        this._xScale.broadcaster.registerListener("pziY" + this.getID(), () => this.resetZoom());
      }
    }

    /**
     * Sets the scales back to their original domains.
     */
    public resetZoom() {
      // HACKHACK #254
      this._zoom = d3.behavior.zoom();
      if (this._xScale) {
        this._zoom.x((<any> this._xScale)._d3Scale);
      }
      if (this._yScale) {
        this._zoom.y((<any> this._yScale)._d3Scale);
      }
      this._zoom.on("zoom", () => this._rerenderZoomed());
      this._zoom(this._hitBox);
    }

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      this.resetZoom();
    }

    private _rerenderZoomed() {
      // HACKHACK since the d3.zoom.x modifies d3 scales and not our TS scales, and the TS scales have the
      // event listener machinery, let's grab the domain out of the d3 scale and pipe it back into the TS scale
      if (this._xScale) {
        var xDomain = (<any> this._xScale)._d3Scale.domain();
        this._xScale.domain(xDomain);
      }

      if (this._yScale) {
        var yDomain = (<any> this._yScale)._d3Scale.domain();
        this._yScale.domain(yDomain);
      }
    }
  }
}
}
