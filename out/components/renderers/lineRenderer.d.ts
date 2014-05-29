/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class LineRenderer extends XYRenderer {
        private path;
        private line;
        public _ANIMATION_DURATION: number;
        /**
        * Creates a LineRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: Scale);
        public _setup(): LineRenderer;
        public _paint(): void;
    }
}
