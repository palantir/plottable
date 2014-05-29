///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var XYDragBoxInteraction = (function (_super) {
        __extends(XYDragBoxInteraction, _super);
        function XYDragBoxInteraction() {
            _super.apply(this, arguments);
        }
        XYDragBoxInteraction.prototype._drag = function () {
            _super.prototype._drag.call(this);
            this.setBox(this.origin[0], this.location[0], this.origin[1], this.location[1]);
        };

        XYDragBoxInteraction.prototype._doDragend = function () {
            if (this.callbackToCall == null) {
                return;
            }
            var xMin = Math.min(this.origin[0], this.location[0]);
            var xMax = Math.max(this.origin[0], this.location[0]);
            var yMin = Math.min(this.origin[1], this.location[1]);
            var yMax = Math.max(this.origin[1], this.location[1]);
            var pixelArea = { xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax };
            this.callbackToCall(pixelArea);
        };
        return XYDragBoxInteraction;
    })(Plottable.DragBoxInteraction);
    Plottable.XYDragBoxInteraction = XYDragBoxInteraction;
})(Plottable || (Plottable = {}));
