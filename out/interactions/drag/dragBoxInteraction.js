///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var DragBoxInteraction = (function (_super) {
        __extends(DragBoxInteraction, _super);
        function DragBoxInteraction() {
            _super.apply(this, arguments);
            this.boxIsDrawn = false;
        }
        DragBoxInteraction.prototype._dragstart = function () {
            _super.prototype._dragstart.call(this);
            if (this.callbackToCall != null) {
                this.callbackToCall(null);
            }
            this.clearBox();
        };

        /**
        * Clears the highlighted drag-selection box drawn by the AreaInteraction.
        *
        * @returns {AreaInteraction} The calling AreaInteraction.
        */
        DragBoxInteraction.prototype.clearBox = function () {
            this.dragBox.attr("height", 0).attr("width", 0);
            this.boxIsDrawn = false;
            return this;
        };

        DragBoxInteraction.prototype.setBox = function (x0, x1, y0, y1) {
            var w = Math.abs(x0 - x1);
            var h = Math.abs(y0 - y1);
            var xo = Math.min(x0, x1);
            var yo = Math.min(y0, y1);
            this.dragBox.attr({ x: xo, y: yo, width: w, height: h });
            this.boxIsDrawn = (w > 0 && h > 0);
            return this;
        };

        DragBoxInteraction.prototype._anchor = function (hitBox) {
            _super.prototype._anchor.call(this, hitBox);
            var cname = DragBoxInteraction.CLASS_DRAG_BOX;
            var background = this.componentToListenTo.backgroundContainer;
            this.dragBox = background.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
            return this;
        };
        DragBoxInteraction.CLASS_DRAG_BOX = "drag-box";
        return DragBoxInteraction;
    })(Plottable.DragInteraction);
    Plottable.DragBoxInteraction = DragBoxInteraction;
})(Plottable || (Plottable = {}));
