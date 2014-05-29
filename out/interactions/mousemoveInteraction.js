///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var MousemoveInteraction = (function (_super) {
        __extends(MousemoveInteraction, _super);
        function MousemoveInteraction(componentToListenTo) {
            _super.call(this, componentToListenTo);
        }
        MousemoveInteraction.prototype._anchor = function (hitBox) {
            var _this = this;
            _super.prototype._anchor.call(this, hitBox);
            hitBox.on("mousemove", function () {
                var xy = d3.mouse(hitBox.node());
                var x = xy[0];
                var y = xy[1];
                _this.mousemove(x, y);
            });
        };

        MousemoveInteraction.prototype.mousemove = function (x, y) {
            return;
        };
        return MousemoveInteraction;
    })(Plottable.Interaction);
    Plottable.MousemoveInteraction = MousemoveInteraction;
})(Plottable || (Plottable = {}));
