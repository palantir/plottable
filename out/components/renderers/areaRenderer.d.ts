/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class AreaRenderer extends XYRenderer {
        private path;
        private area;
        public _ANIMATION_DURATION: number;
        /**
        * Creates an AreaRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: Scale);
        public _setup(): AreaRenderer;
        public _paint(): void;
    }
}
