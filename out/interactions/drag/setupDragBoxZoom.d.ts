/// <reference path="../../reference.d.ts" />
declare module Plottable {
    interface IPixelArea {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    }
    function setupDragBoxZoom(dragBox: XYDragBoxInteraction, xScale: QuantitiveScale, yScale: QuantitiveScale): void;
}
