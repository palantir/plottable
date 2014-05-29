///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var XDragBoxInteraction = (function (_super) {
        __extends(XDragBoxInteraction, _super);
        function XDragBoxInteraction() {
            _super.apply(this, arguments);
        }
        XDragBoxInteraction.prototype._drag = function () {
            _super.prototype._drag.call(this);
            this.setBox(this.origin[0], this.location[0]);
        };

        XDragBoxInteraction.prototype._doDragend = function () {
            if (this.callbackToCall == null) {
                return;
            }
            var xMin = Math.min(this.origin[0], this.location[0]);
            var xMax = Math.max(this.origin[0], this.location[0]);
            var pixelArea = { xMin: xMin, xMax: xMax };
            this.callbackToCall(pixelArea);
        };

        XDragBoxInteraction.prototype.setBox = function (x0, x1) {
            _super.prototype.setBox.call(this, x0, x1, 0, this.componentToListenTo.availableHeight);
            return this;
        };
        return XDragBoxInteraction;
    })(Plottable.DragBoxInteraction);
    Plottable.XDragBoxInteraction = XDragBoxInteraction;
})(Plottable || (Plottable = {}));
