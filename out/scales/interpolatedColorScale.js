///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    ;

    var InterpolatedColorScale = (function (_super) {
        __extends(InterpolatedColorScale, _super);
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
        function InterpolatedColorScale(colorRange, scaleType) {
            if (typeof colorRange === "undefined") { colorRange = "reds"; }
            if (typeof scaleType === "undefined") { scaleType = "linear"; }
            this._colorRange = this._resolveColorValues(colorRange);
            this._scaleType = scaleType;
            _super.call(this, InterpolatedColorScale.getD3InterpolatedScale(this._colorRange, this._scaleType));
        }
        /**
        * Converts the string array into a d3 scale.
        *
        * @param {string[]} colors an array of strings representing color
        *     values in hex ("#FFFFFF") or keywords ("white").
        * @param {string} scaleType a string representing the underlying scale
        *     type (linear/log/sqrt/pow)
        * @returns a quantitive d3 scale.
        */
        InterpolatedColorScale.getD3InterpolatedScale = function (colors, scaleType) {
            var scale;
            switch (scaleType) {
                case "linear":
                    scale = d3.scale.linear();
                    break;
                case "log":
                    scale = d3.scale.log();
                    break;
                case "sqrt":
                    scale = d3.scale.sqrt();
                    break;
                case "pow":
                    scale = d3.scale.pow();
                    break;
            }
            if (scale == null) {
                throw new Error("unknown quantitive scale type " + scaleType);
            }
            return scale.range([0, 1]).interpolate(InterpolatedColorScale.interpolateColors(colors));
        };

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
        InterpolatedColorScale.interpolateColors = function (colors) {
            if (colors.length < 2) {
                throw new Error("Color scale arrays must have at least two elements.");
            }
            ;
            return function (ignored) {
                return function (t) {
                    // Clamp t parameter to [0,1]
                    t = Math.max(0, Math.min(1, t));

                    // Determine indices for colors
                    var tScaled = t * (colors.length - 1);
                    var i0 = Math.floor(tScaled);
                    var i1 = Math.ceil(tScaled);
                    var frac = (tScaled - i0);

                    // Interpolate in the L*a*b color space
                    return d3.interpolateLab(colors[i0], colors[i1])(frac);
                };
            };
        };

        InterpolatedColorScale.prototype.colorRange = function (colorRange) {
            if (colorRange == null) {
                return this._colorRange;
            }
            this._colorRange = this._resolveColorValues(colorRange);
            this._resetScale();
        };

        InterpolatedColorScale.prototype.scaleType = function (scaleType) {
            if (scaleType == null) {
                return this._scaleType;
            }
            this._scaleType = scaleType;
            this._resetScale();
        };

        InterpolatedColorScale.prototype._resetScale = function () {
            this._d3Scale = InterpolatedColorScale.getD3InterpolatedScale(this._colorRange, this._scaleType);
            if (this._autoDomain) {
                this.autoDomain();
            }
            this._broadcast();
        };

        InterpolatedColorScale.prototype._resolveColorValues = function (colorRange) {
            if (colorRange instanceof Array) {
                return colorRange;
            } else if (InterpolatedColorScale.COLOR_SCALES[colorRange] != null) {
                return InterpolatedColorScale.COLOR_SCALES[colorRange];
            } else {
                return InterpolatedColorScale.COLOR_SCALES["reds"];
            }
        };
        InterpolatedColorScale.COLOR_SCALES = {
            reds: [
                "#FFFFFF",
                "#FFF6E1",
                "#FEF4C0",
                "#FED976",
                "#FEB24C",
                "#FD8D3C",
                "#FC4E2A",
                "#E31A1C",
                "#B10026"
            ],
            blues: [
                "#FFFFFF",
                "#CCFFFF",
                "#A5FFFD",
                "#85F7FB",
                "#6ED3EF",
                "#55A7E0",
                "#417FD0",
                "#2545D3",
                "#0B02E1"
            ],
            posneg: [
                "#0B02E1",
                "#2545D3",
                "#417FD0",
                "#55A7E0",
                "#6ED3EF",
                "#85F7FB",
                "#A5FFFD",
                "#CCFFFF",
                "#FFFFFF",
                "#FFF6E1",
                "#FEF4C0",
                "#FED976",
                "#FEB24C",
                "#FD8D3C",
                "#FC4E2A",
                "#E31A1C",
                "#B10026"
            ]
        };
        return InterpolatedColorScale;
    })(Plottable.QuantitiveScale);
    Plottable.InterpolatedColorScale = InterpolatedColorScale;
})(Plottable || (Plottable = {}));
