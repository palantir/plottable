/// <reference path="../reference.d.ts" />
declare module Plottable {
    class PanZoomInteraction extends Interaction {
        private zoom;
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
        constructor(componentToListenTo: Component, xScale: QuantitiveScale, yScale: QuantitiveScale);
        public resetZoom(): void;
        public _anchor(hitBox: D3.Selection): void;
        private rerenderZoomed();
    }
}
