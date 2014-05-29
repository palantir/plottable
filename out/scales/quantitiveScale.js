///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var QuantitiveScale = (function (_super) {
        __extends(QuantitiveScale, _super);
        /**
        * Creates a new QuantitiveScale.
        *
        * @constructor
        * @param {D3.Scale.QuantitiveScale} scale The D3 QuantitiveScale backing the QuantitiveScale.
        */
        function QuantitiveScale(scale) {
            _super.call(this, scale);
            this.lastRequestedTickCount = 10;
        }
        QuantitiveScale.prototype._getExtent = function () {
            var extents = this._getAllExtents();
            var starts = extents.map(function (e) {
                return e[0];
            });
            var ends = extents.map(function (e) {
                return e[1];
            });
            if (starts.length > 0) {
                return [d3.min(starts), d3.max(ends)];
            } else {
                return [0, 1];
            }
        };

        QuantitiveScale.prototype.autoDomain = function () {
            _super.prototype.autoDomain.call(this);
            if (this._autoPad) {
                this.padDomain();
            }
            if (this._autoNice) {
                this.nice();
            }
            return this;
        };

        /**
        * Retrieves the domain value corresponding to a supplied range value.
        *
        * @param {number} value: A value from the Scale's range.
        * @returns {number} The domain value corresponding to the supplied range value.
        */
        QuantitiveScale.prototype.invert = function (value) {
            return this._d3Scale.invert(value);
        };

        /**
        * Creates a copy of the QuantitiveScale with the same domain and range but without any registered listeners.
        *
        * @returns {QuantitiveScale} A copy of the calling QuantitiveScale.
        */
        QuantitiveScale.prototype.copy = function () {
            return new QuantitiveScale(this._d3Scale.copy());
        };

        QuantitiveScale.prototype.domain = function (values) {
            return _super.prototype.domain.call(this, values);
        };

        QuantitiveScale.prototype.interpolate = function (factory) {
            if (factory == null) {
                return this._d3Scale.interpolate();
            }
            this._d3Scale.interpolate(factory);
            return this;
        };

        /**
        * Sets the range of the QuantitiveScale and sets the interpolator to d3.interpolateRound.
        *
        * @param {number[]} values The new range value for the range.
        */
        QuantitiveScale.prototype.rangeRound = function (values) {
            this._d3Scale.rangeRound(values);
            return this;
        };

        QuantitiveScale.prototype.clamp = function (clamp) {
            if (clamp == null) {
                return this._d3Scale.clamp();
            }
            this._d3Scale.clamp(clamp);
            return this;
        };

        /**
        * Extends the scale's domain so it starts and ends with "nice" values.
        *
        * @param {number} [count] The number of ticks that should fit inside the new domain.
        */
        QuantitiveScale.prototype.nice = function (count) {
            this._d3Scale.nice(count);
            this._setDomain(this._d3Scale.domain()); // nice() can change the domain, so update all listeners
            return this;
        };

        /**
        * Generates tick values.
        *
        * @param {number} [count] The number of ticks to generate.
        * @returns {any[]} The generated ticks.
        */
        QuantitiveScale.prototype.ticks = function (count) {
            if (count != null) {
                this.lastRequestedTickCount = count;
            }
            return this._d3Scale.ticks(this.lastRequestedTickCount);
        };

        /**
        * Gets a tick formatting function for displaying tick values.
        *
        * @param {number} count The number of ticks to be displayed
        * @param {string} [format] A format specifier string.
        * @returns {(n: number) => string} A formatting function.
        */
        QuantitiveScale.prototype.tickFormat = function (count, format) {
            return this._d3Scale.tickFormat(count, format);
        };

        /**
        * Pads out the domain of the scale by a specified ratio.
        *
        * @param {number} [padProportion] Proportionally how much bigger the new domain should be (0.05 = 5% larger)
        * @returns {QuantitiveScale} The calling QuantitiveScale.
        */
        QuantitiveScale.prototype.padDomain = function (padProportion) {
            if (typeof padProportion === "undefined") { padProportion = 0.05; }
            var currentDomain = this.domain();
            if (currentDomain[0] === currentDomain[1]) {
                this._setDomain([currentDomain[0] - 1, currentDomain[0] + 1]);
                return this;
            }

            var extent = currentDomain[1] - currentDomain[0];
            var newDomain = [currentDomain[0] - padProportion / 2 * extent, currentDomain[1] + padProportion / 2 * extent];
            if (currentDomain[0] === 0) {
                newDomain[0] = 0;
            }
            if (currentDomain[1] === 0) {
                newDomain[1] = 0;
            }
            this._setDomain(newDomain);
            return this;
        };
        return QuantitiveScale;
    })(Plottable.Scale);
    Plottable.QuantitiveScale = QuantitiveScale;
})(Plottable || (Plottable = {}));
