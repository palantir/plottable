/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class HorizontalBarRenderer extends AbstractBarRenderer {
        public _barAlignment: string;
        /**
        * Creates a HorizontalBarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: QuantitiveScale, yScale: Scale);
        public _paint(): void;
        /**
        * Sets the vertical alignment of the bars.
        *
        * @param {string} alignment Which part of the bar should align with the bar's x-value (top/middle/bottom).
        * @return {HorizontalBarRenderer} The calling HorizontalBarRenderer.
        */
        public barAlignment(alignment: string): HorizontalBarRenderer;
    }
}
