/// <reference path="../reference.d.ts" />
declare module Plottable {
    class Legend extends Component {
        private static SUBELEMENT_CLASS;
        private static MARGIN;
        private colorScale;
        private maxWidth;
        private legendBox;
        private nRowsDrawn;
        /**
        * Creates a Legend.
        *
        * @constructor
        * @param {ColorScale} colorScale
        */
        constructor(colorScale?: ColorScale);
        public _setup(): Legend;
        /**
        * Assigns a new ColorScale to the Legend.
        *
        * @param {ColorScale} scale
        * @returns {Legend} The calling Legend.
        */
        public scale(scale: ColorScale): Legend;
        public scale(): ColorScale;
        public _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): Legend;
        public _requestedSpace(offeredWidth: number, offeredY: number): ISpaceRequest;
        private measureTextHeight();
        public _doRender(): Legend;
    }
}
