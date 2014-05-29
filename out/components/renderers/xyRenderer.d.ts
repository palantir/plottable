/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class XYRenderer extends Renderer {
        public dataSelection: D3.UpdateSelection;
        public xScale: Scale;
        public yScale: Scale;
        public _xAccessor: any;
        public _yAccessor: any;
        /**
        * Creates an XYRenderer.
        *
        * @constructor
        * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: Scale);
        public project(attrToSet: string, accessor: any, scale?: Scale): XYRenderer;
        public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): XYRenderer;
        private rescale();
    }
}
