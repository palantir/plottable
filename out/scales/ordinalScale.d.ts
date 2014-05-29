/// <reference path="../reference.d.ts" />
declare module Plottable {
    class OrdinalScale extends Scale {
        public _d3Scale: D3.Scale.OrdinalScale;
        private _range;
        private _rangeType;
        private _innerPadding;
        private _outerPadding;
        /**
        * Creates a new OrdinalScale. Domain and Range are set later.
        *
        * @constructor
        */
        constructor(scale?: D3.Scale.OrdinalScale);
        public _getExtent(): any[];
        /**
        * Retrieves the current domain, or sets the Scale's domain to the specified values.
        *
        * @param {any[]} [values] The new values for the domain. This array may contain more than 2 values.
        * @returns {any[]|Scale} The current domain, or the calling Scale (if values is supplied).
        */
        public domain(): any[];
        public domain(values: any[]): OrdinalScale;
        public _setDomain(values: any[]): void;
        /**
        * Returns the range of pixels spanned by the scale, or sets the range.
        *
        * @param {number[]} [values] The pixel range to set on the scale.
        * @returns {number[]|OrdinalScale} The pixel range, or the calling OrdinalScale.
        */
        public range(): any[];
        public range(values: number[]): OrdinalScale;
        /**
        * Returns the width of the range band. Only valid when rangeType is set to "bands".
        *
        * @returns {number} The range band width or 0 if rangeType isn't "bands".
        */
        public rangeBand(): number;
        /**
        * Returns the range type, or sets the range type.
        *
        * @param {string} [rangeType] Either "points" or "bands" indicating the
        *     d3 method used to generate range bounds.
        * @param {number} [outerPadding] The padding outside the range,
        *     proportional to the range step.
        * @param {number} [innerPadding] The padding between bands in the range,
        *     proportional to the range step. This parameter is only used in
        *     "bands" type ranges.
        * @returns {string|OrdinalScale} The current range type, or the calling
        *     OrdinalScale.
        */
        public rangeType(): string;
        public rangeType(rangeType: string, outerPadding?: number, innerPadding?: number): OrdinalScale;
    }
}
