///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var OrdinalScale = (function (_super) {
        __extends(OrdinalScale, _super);
        /**
        * Creates a new OrdinalScale. Domain and Range are set later.
        *
        * @constructor
        */
        function OrdinalScale(scale) {
            _super.call(this, scale == null ? d3.scale.ordinal() : scale);
            this._range = [0, 1];
            this._rangeType = "bands";
            // Padding as a proportion of the spacing between domain values
            this._innerPadding = 0.3;
            this._outerPadding = 0.5;
        }
        OrdinalScale.prototype._getExtent = function () {
            var extents = this._getAllExtents();
            var concatenatedExtents = [];
            extents.forEach(function (e) {
                concatenatedExtents = concatenatedExtents.concat(e);
            });
            return Plottable.Utils.uniq(concatenatedExtents);
        };

        OrdinalScale.prototype.domain = function (values) {
            return _super.prototype.domain.call(this, values);
        };

        OrdinalScale.prototype._setDomain = function (values) {
            _super.prototype._setDomain.call(this, values);
            this.range(this.range()); // update range
        };

        OrdinalScale.prototype.range = function (values) {
            if (values == null) {
                return this._range;
            } else {
                this._range = values;
                if (this._rangeType === "points") {
                    this._d3Scale.rangePoints(values, 2 * this._outerPadding); // d3 scale takes total padding
                } else if (this._rangeType === "bands") {
                    this._d3Scale.rangeBands(values, this._innerPadding, this._outerPadding);
                }
                return this;
            }
        };

        /**
        * Returns the width of the range band. Only valid when rangeType is set to "bands".
        *
        * @returns {number} The range band width or 0 if rangeType isn't "bands".
        */
        OrdinalScale.prototype.rangeBand = function () {
            return this._d3Scale.rangeBand();
        };

        OrdinalScale.prototype.rangeType = function (rangeType, outerPadding, innerPadding) {
            if (rangeType == null) {
                return this._rangeType;
            } else {
                if (!(rangeType === "points" || rangeType === "bands")) {
                    throw new Error("Unsupported range type: " + rangeType);
                }
                this._rangeType = rangeType;
                if (outerPadding != null) {
                    this._outerPadding = outerPadding;
                }
                if (innerPadding != null) {
                    this._innerPadding = innerPadding;
                }
                this._broadcast();
                return this;
            }
        };
        return OrdinalScale;
    })(Plottable.Scale);
    Plottable.OrdinalScale = OrdinalScale;
})(Plottable || (Plottable = {}));
