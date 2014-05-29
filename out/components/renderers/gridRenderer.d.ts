/// <reference path="../../reference.d.ts" />
declare module Plottable {
    class GridRenderer extends XYRenderer {
        public colorScale: Scale;
        public xScale: OrdinalScale;
        public yScale: OrdinalScale;
        /**
        * Creates a GridRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {OrdinalScale} xScale The x scale to use.
        * @param {OrdinalScale} yScale The y scale to use.
        * @param {ColorScale|InterpolatedColorScale} colorScale The color scale to use for each grid
        *     cell.
        */
        constructor(dataset: any, xScale: OrdinalScale, yScale: OrdinalScale, colorScale: Scale);
        public project(attrToSet: string, accessor: any, scale?: Scale): GridRenderer;
        public _paint(): void;
    }
}
