/// <reference path="../reference.d.ts" />
declare module Plottable {
    class Gridlines extends Component {
        private xScale;
        private yScale;
        private xLinesContainer;
        private yLinesContainer;
        /**
        * Creates a set of Gridlines.
        * @constructor
        *
        * @param {QuantitiveScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
        * @param {QuantitiveScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
        */
        constructor(xScale: QuantitiveScale, yScale: QuantitiveScale);
        public _setup(): Gridlines;
        public _doRender(): Gridlines;
        private redrawXLines();
        private redrawYLines();
    }
}
