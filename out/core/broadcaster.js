///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Broadcaster = (function (_super) {
        __extends(Broadcaster, _super);
        function Broadcaster() {
            _super.apply(this, arguments);
            this.listener2Callback = new Plottable.StrictEqualityAssociativeArray();
        }
        /**
        * Registers a callback to be called when the broadcast method is called. Also takes a listener which
        * is used to support deregistering the same callback later, by passing in the same listener.
        * If there is already a callback associated with that listener, then the callback will be replaced.
        *
        * This should NOT be called directly by a Component; registerToBroadcaster should be used instead.
        *
        * @param listener The listener associated with the callback.
        * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
        * @returns {Broadcaster} this object
        */
        Broadcaster.prototype.registerListener = function (listener, callback) {
            this.listener2Callback.set(listener, callback);
            return this;
        };

        /**
        * Call all listening callbacks, optionally with arguments passed through.
        *
        * @param ...args A variable number of optional arguments
        * @returns {Broadcaster} this object
        */
        Broadcaster.prototype._broadcast = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            this.listener2Callback.values().forEach(function (callback) {
                return callback(_this, args);
            });
            return this;
        };

        /**
        * Registers deregister the callback associated with a listener.
        *
        * @param listener The listener to deregister.
        * @returns {Broadcaster} this object
        */
        Broadcaster.prototype.deregisterListener = function (listener) {
            var listenerWasFound = this.listener2Callback.delete(listener);
            if (listenerWasFound) {
                return this;
            } else {
                throw new Error("Attempted to deregister listener, but listener not found");
            }
        };
        return Broadcaster;
    })(Plottable.PlottableObject);
    Plottable.Broadcaster = Broadcaster;
})(Plottable || (Plottable = {}));
