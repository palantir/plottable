///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var KeyInteraction = (function (_super) {
        __extends(KeyInteraction, _super);
        /**
        * Creates a KeyInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for keypresses on.
        * @param {number} keyCode The key code to listen for.
        */
        function KeyInteraction(componentToListenTo, keyCode) {
            _super.call(this, componentToListenTo);
            this.activated = false;
            this.keyCode = keyCode;
        }
        KeyInteraction.prototype._anchor = function (hitBox) {
            var _this = this;
            _super.prototype._anchor.call(this, hitBox);
            hitBox.on("mouseover", function () {
                _this.activated = true;
            });
            hitBox.on("mouseout", function () {
                _this.activated = false;
            });

            Plottable.KeyEventListener.addCallback(this.keyCode, function (e) {
                if (_this.activated && _this._callback != null) {
                    _this._callback();
                }
            });
        };

        /**
        * Sets an callback to be called when the designated key is pressed.
        *
        * @param {() => any} cb: Callback to be called.
        */
        KeyInteraction.prototype.callback = function (cb) {
            this._callback = cb;
            return this;
        };
        return KeyInteraction;
    })(Plottable.Interaction);
    Plottable.KeyInteraction = KeyInteraction;
})(Plottable || (Plottable = {}));
