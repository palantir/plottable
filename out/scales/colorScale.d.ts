/// <reference path="../reference.d.ts" />
declare module Plottable {
    class ColorScale extends Scale {
        /**
        * Creates a ColorScale.
        *
        * @constructor
        * @param {string} [scaleType] the type of color scale to create
        *     (Category10/Category20/Category20b/Category20c).
        */
        constructor(scaleType?: string);
        public _getExtent(): any[];
    }
}
