/// <reference path="../reference.d.ts" />
declare module Plottable {
    class InterpolatedColorScale extends QuantitiveScale {
        private static COLOR_SCALES;
        /**
        * Converts the string array into a d3 scale.
        *
        * @param {string[]} colors an array of strings representing color
        *     values in hex ("#FFFFFF") or keywords ("white").
        * @param {string} scaleType a string representing the underlying scale
        *     type (linear/log/sqrt/pow)
        * @returns a quantitive d3 scale.
        */
        private static getD3InterpolatedScale(colors, scaleType);
        /**
        * Creates a d3 interpolator given the color array.
        *
        * d3 doesn't accept more than 2 range values unless we use a ordinal
        * scale. So, in order to interpolate smoothly between the full color
        * range, we must override the interpolator and compute the color values
        * manually.
        *
        * @param {string[]} colors an array of strings representing color
        *     values in hex ("#FFFFFF") or keywords ("white").
        */
        private static interpolateColors(colors);
        private _colorRange;
        private _scaleType;
        /**
        * Creates a InterpolatedColorScale.
        *
        * @constructor
        * @param {string|string[]} [colorRange] the type of color scale to
        *     create. Default is "reds". @see {@link colorRange} for further
        *     options.
        * @param {string} [scaleType] the type of underlying scale to use
        *     (linear/pow/log/sqrt). Default is "linear". @see {@link scaleType}
        *     for further options.
        */
        constructor(colorRange?: any, scaleType?: string);
        /**
        * Gets or sets the color range.
        *
        * @param {string|string[]} [colorRange]. If no argument is passed,
        *     returns the current range of colors. If the param is one of
        *     (reds/blues/posneg) we lookup the scale from the built-in color
        *     groups. Finally, if params is an array of strings with at least 2
        *     values (e.g. ["#FF00FF", "red", "dodgerblue"], the resulting scale
        *     will interpolate between the color values across the domain.
        *
        * @returns the current color values for the range as strings or this
        *     InterpolatedColorScale object.
        */
        public colorRange(): string[];
        public colorRange(colorRange: any): InterpolatedColorScale;
        /**
        * Gets or sets the internal scale type.
        *
        * @param {string} [scaleType]. If no argument is passed, returns the
        *     current scale type string. Otherwise, we set the internal scale
        *     using the d3 scale name. These scales must be quantitative scales,
        *     so the valid values are (linear/log/sqrt/pow).
        *
        * @returns the current scale type or this InterpolatedColorScale object.
        */
        public scaleType(): string;
        public scaleType(scaleType: string): InterpolatedColorScale;
        private _resetScale();
        private _resolveColorValues(colorRange);
    }
}
