/// <reference path="../reference.d.ts" />
declare module Plottable {
    class QuantitiveScale extends Scale {
        public _d3Scale: D3.Scale.QuantitiveScale;
        private lastRequestedTickCount;
        /**
        * Creates a new QuantitiveScale.
        *
        * @constructor
        * @param {D3.Scale.QuantitiveScale} scale The D3 QuantitiveScale backing the QuantitiveScale.
        */
        constructor(scale: D3.Scale.QuantitiveScale);
        public _getExtent(): any[];
        public autoDomain(): QuantitiveScale;
        /**
        * Retrieves the domain value corresponding to a supplied range value.
        *
        * @param {number} value: A value from the Scale's range.
        * @returns {number} The domain value corresponding to the supplied range value.
        */
        public invert(value: number): number;
        /**
        * Creates a copy of the QuantitiveScale with the same domain and range but without any registered listeners.
        *
        * @returns {QuantitiveScale} A copy of the calling QuantitiveScale.
        */
        public copy(): QuantitiveScale;
        public domain(): any[];
        public domain(values: any[]): QuantitiveScale;
        /**
        * Sets or gets the QuantitiveScale's output interpolator
        *
        * @param {D3.Transition.Interpolate} [factory] The output interpolator to use.
        * @returns {D3.Transition.Interpolate|QuantitiveScale} The current output interpolator, or the calling QuantitiveScale.
        */
        public interpolate(): D3.Transition.Interpolate;
        public interpolate(factory: D3.Transition.Interpolate): QuantitiveScale;
        /**
        * Sets the range of the QuantitiveScale and sets the interpolator to d3.interpolateRound.
        *
        * @param {number[]} values The new range value for the range.
        */
        public rangeRound(values: number[]): QuantitiveScale;
        /**
        * Gets or sets the clamp status of the QuantitiveScale (whether to cut off values outside the ouput range).
        *
        * @param {boolean} [clamp] Whether or not to clamp the QuantitiveScale.
        * @returns {boolean|QuantitiveScale} The current clamp status, or the calling QuantitiveScale.
        */
        public clamp(): boolean;
        public clamp(clamp: boolean): QuantitiveScale;
        /**
        * Extends the scale's domain so it starts and ends with "nice" values.
        *
        * @param {number} [count] The number of ticks that should fit inside the new domain.
        */
        public nice(count?: number): QuantitiveScale;
        /**
        * Generates tick values.
        *
        * @param {number} [count] The number of ticks to generate.
        * @returns {any[]} The generated ticks.
        */
        public ticks(count?: number): any[];
        /**
        * Gets a tick formatting function for displaying tick values.
        *
        * @param {number} count The number of ticks to be displayed
        * @param {string} [format] A format specifier string.
        * @returns {(n: number) => string} A formatting function.
        */
        public tickFormat(count: number, format?: string): (n: number) => string;
        /**
        * Pads out the domain of the scale by a specified ratio.
        *
        * @param {number} [padProportion] Proportionally how much bigger the new domain should be (0.05 = 5% larger)
        * @returns {QuantitiveScale} The calling QuantitiveScale.
        */
        public padDomain(padProportion?: number): QuantitiveScale;
    }
}
