/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class CircleRenderer extends XYRenderer {
        /**
        * Creates a CircleRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: Scale);
        public project(attrToSet: string, accessor: any, scale?: Scale): CircleRenderer;
        public _paint(): void;
    }
}
