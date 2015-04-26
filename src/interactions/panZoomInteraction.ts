///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  export class PanZoom extends Interaction {

    private xScale: QuantitativeScale<any>;
    private yScale: QuantitativeScale<any>;
    private zoom: D3.Behavior.Zoom;

    /**
     * Creates a PanZoomInteraction.
     *
     * The allows you to move around and zoom in on a plot, interactively. It
     * does so by changing the xScale and yScales' domains repeatedly.
     *
     * @constructor
     * @param {QuantitativeScaleScale} [xScale] The X scale to update on panning/zooming.
     * @param {QuantitativeScaleScale} [yScale] The Y scale to update on panning/zooming.
     */
    constructor(xScale?: QuantitativeScale<any>, yScale?: QuantitativeScale<any>) {
      super();
      if (xScale) {
        this.xScale = xScale;
        // HACKHACK #1388: self-register for resetZoom()
        this.xScale.broadcaster.registerListener("pziX" + this.getID(), () => this.resetZoom());
      }
      if (yScale) {
        this.yScale = yScale;
        // HACKHACK #1388: self-register for resetZoom()
        this.yScale.broadcaster.registerListener("pziY" + this.getID(), () => this.resetZoom());
      }
    }

    public anchor(component: Component, hitBox: D3.Selection) {
      super.anchor(component, hitBox);
      this.resetZoom();
    }

    /**
     * Sets the scales back to their original domains.
     */
    public resetZoom() {
      // HACKHACK #254
      this.zoom = d3.behavior.zoom();
      if (this.xScale) {
        this.zoom.x((<any> this.xScale)._d3Scale);
      }
      if (this.yScale) {
        this.zoom.y((<any> this.yScale)._d3Scale);
      }
      this.zoom.on("zoom", () => this.rerenderZoomed());
      this.zoom(this.hitBox);
    }

    public requiresHitbox() {
      return true;
    }

    private rerenderZoomed() {
      // HACKHACK since the d3.zoom.x modifies d3 scales and not our TS scales, and the TS scales have the
      // event listener machinery, let's grab the domain out of the d3 scale and pipe it back into the TS scale
      if (this.xScale) {
        var xDomain = (<any> this.xScale)._d3Scale.domain();
        this.xScale.domain(xDomain);
      }

      if (this.yScale) {
        var yDomain = (<any> this.yScale)._d3Scale.domain();
        this.yScale.domain(yDomain);
      }
    }
  }
}
}
