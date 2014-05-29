/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class AbstractBarRenderer extends XYRenderer {
        public _baseline: D3.Selection;
        public _baselineValue: number;
        public _barAlignment: string;
        /**
        * Creates an AbstractBarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: Scale);
        public _setup(): AbstractBarRenderer;
        /**
        * Sets the baseline for the bars to the specified value.
        *
        * @param {number} value The value to position the baseline at.
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        public baseline(value: number): AbstractBarRenderer;
        /**
        * Sets the bar alignment relative to the independent axis.
        * Behavior depends on subclass implementation.
        *
        * @param {string} alignment The desired alignment.
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        public barAlignment(alignment: string): AbstractBarRenderer;
        /**
        * Selects the bar under the given pixel position.
        *
        * @param {number} x The pixel x position.
        * @param {number} y The pixel y position.
        * @param {boolean} [select] Whether or not to select the bar (by classing it "selected");
        * @return {D3.Selection} The selected bar, or null if no bar was selected.
        */
        public selectBar(x: number, y: number, select?: boolean): D3.Selection;
        /**
        * Deselects all bars.
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        public deselectAll(): AbstractBarRenderer;
    }
}
