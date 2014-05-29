///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var LinearScale = (function (_super) {
        __extends(LinearScale, _super);
        function LinearScale(scale) {
            _super.call(this, scale == null ? d3.scale.linear() : scale);
        }
        /**
        * Creates a copy of the LinearScale with the same domain and range but without any registered listeners.
        *
        * @returns {LinearScale} A copy of the calling LinearScale.
        */
        LinearScale.prototype.copy = function () {
            return new LinearScale(this._d3Scale.copy());
        };
        return LinearScale;
    })(Plottable.QuantitiveScale);
    Plottable.LinearScale = LinearScale;
})(Plottable || (Plottable = {}));
