/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class BarRenderer extends AbstractBarRenderer {
        public _barAlignment: string;
        /**
        * Creates a BarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: QuantitiveScale);
        public _paint(): void;
        /**
        * Sets the horizontal alignment of the bars.
        *
        * @param {string} alignment Which part of the bar should align with the bar's x-value (left/center/right).
        * @return {BarRenderer} The calling BarRenderer.
        */
        public barAlignment(alignment: string): BarRenderer;
    }
}
