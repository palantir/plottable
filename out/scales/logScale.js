///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var LogScale = (function (_super) {
        __extends(LogScale, _super);
        function LogScale(scale) {
            _super.call(this, scale == null ? d3.scale.log() : scale);
        }
        /**
        * Creates a copy of the LogScale with the same domain and range but without any registered listeners.
        *
        * @returns {LogScale} A copy of the calling LogScale.
        */
        LogScale.prototype.copy = function () {
            return new LogScale(this._d3Scale.copy());
        };
        return LogScale;
    })(Plottable.QuantitiveScale);
    Plottable.LogScale = LogScale;
})(Plottable || (Plottable = {}));
