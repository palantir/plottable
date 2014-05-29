///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var ClickInteraction = (function (_super) {
        __extends(ClickInteraction, _super);
        /**
        * Creates a ClickInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for clicks on.
        */
        function ClickInteraction(componentToListenTo) {
            _super.call(this, componentToListenTo);
        }
        ClickInteraction.prototype._anchor = function (hitBox) {
            var _this = this;
            _super.prototype._anchor.call(this, hitBox);
            hitBox.on("click", function () {
                var xy = d3.mouse(hitBox.node());
                var x = xy[0];
                var y = xy[1];
                _this._callback(x, y);
            });
        };

        /**
        * Sets an callback to be called when a click is received.
        *
        * @param {(x: number, y: number) => any} cb: Callback to be called. Takes click x and y in pixels.
        */
        ClickInteraction.prototype.callback = function (cb) {
            this._callback = cb;
            return this;
        };
        return ClickInteraction;
    })(Plottable.Interaction);
    Plottable.ClickInteraction = ClickInteraction;
})(Plottable || (Plottable = {}));
