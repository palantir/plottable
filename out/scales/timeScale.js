///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var TimeScale = (function (_super) {
        __extends(TimeScale, _super);
        /**
        * Creates a new TimeScale.
        *
        * @constructor
        */
        function TimeScale() {
            _super.call(this, d3.time.scale());
        }
        return TimeScale;
    })(Plottable.QuantitiveScale);
    Plottable.TimeScale = TimeScale;
})(Plottable || (Plottable = {}));
