///<reference path="../reference.ts" />

module Plottable {
  export class PanZoomInteraction extends Interaction {
    private zoom: D3.Behavior.Zoom;
    public xScale: QuantitiveScale;
    public yScale: QuantitiveScale;

    /**
     * Creates a PanZoomInteraction.
     *
     * @constructor
     * @param {Component} componentToListenTo The component to listen for interactions on.
     * @param {QuantitiveScale} xScale The X scale to update on panning/zooming.
     * @param {QuantitiveScale} yScale The Y scale to update on panning/zooming.
     */
    constructor(componentToListenTo: Component, xScale: QuantitiveScale, yScale: QuantitiveScale) {
      super(componentToListenTo);
      this.xScale = xScale;
      this.yScale = yScale;
      this.zoom = d3.behavior.zoom();
      this.zoom.x(this.xScale._d3Scale);
      this.zoom.y(this.yScale._d3Scale);
      this.zoom.on("zoom", () => this.rerenderZoomed());
    }

    public resetZoom() {
      // HACKHACK #254
      this.zoom = d3.behavior.zoom();
      this.zoom.x(this.xScale._d3Scale);
      this.zoom.y(this.yScale._d3Scale);
      this.zoom.on("zoom", () => this.rerenderZoomed());
      this.zoom(this.hitBox);
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      this.zoom(hitBox);
    }

    private rerenderZoomed() {
      // HACKHACK since the d3.zoom.x modifies d3 scales and not our TS scales, and the TS scales have the
      // event listener machinery, let's grab the domain out of the d3 scale and pipe it back into the TS scale
      var xDomain = this.xScale._d3Scale.domain();
      var yDomain = this.yScale._d3Scale.domain();
      this.xScale.domain(xDomain);
      this.yScale.domain(yDomain);
    }
  }
}
