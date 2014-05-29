///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var ColorScale = (function (_super) {
        __extends(ColorScale, _super);
        /**
        * Creates a ColorScale.
        *
        * @constructor
        * @param {string} [scaleType] the type of color scale to create
        *     (Category10/Category20/Category20b/Category20c).
        */
        function ColorScale(scaleType) {
            var scale;
            switch (scaleType) {
                case "Category10":
                case "category10":
                case "10":
                    scale = d3.scale.category10();
                    break;
                case "Category20":
                case "category20":
                case "20":
                    scale = d3.scale.category20();
                    break;
                case "Category20b":
                case "category20b":
                case "20b":
                    scale = d3.scale.category20b();
                    break;
                case "Category20c":
                case "category20c":
                case "20c":
                    scale = d3.scale.category20c();
                    break;
                case null:
                case undefined:
                    scale = d3.scale.ordinal();
                    break;
                default:
                    throw new Error("Unsupported ColorScale type");
            }
            _super.call(this, scale);
        }
        // Duplicated from OrdinalScale._getExtent - should be removed in #388
        ColorScale.prototype._getExtent = function () {
            var extents = this._getAllExtents();
            var concatenatedExtents = [];
            extents.forEach(function (e) {
                concatenatedExtents = concatenatedExtents.concat(e);
            });
            return Plottable.Utils.uniq(concatenatedExtents);
        };
        return ColorScale;
    })(Plottable.Scale);
    Plottable.ColorScale = ColorScale;
})(Plottable || (Plottable = {}));
