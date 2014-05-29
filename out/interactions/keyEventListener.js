///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var KeyEventListener = (function () {
        function KeyEventListener() {
        }
        KeyEventListener.initialize = function () {
            if (KeyEventListener.initialized) {
                return;
            }
            d3.select(document).on("keydown", KeyEventListener.processEvent);
            KeyEventListener.initialized = true;
        };

        KeyEventListener.addCallback = function (keyCode, cb) {
            if (!KeyEventListener.initialized) {
                KeyEventListener.initialize();
            }

            if (KeyEventListener.callbacks[keyCode] == null) {
                KeyEventListener.callbacks[keyCode] = [];
            }

            KeyEventListener.callbacks[keyCode].push(cb);
        };

        KeyEventListener.processEvent = function () {
            if (KeyEventListener.callbacks[d3.event.keyCode] == null) {
                return;
            }

            KeyEventListener.callbacks[d3.event.keyCode].forEach(function (cb) {
                cb(d3.event);
            });
        };
        KeyEventListener.initialized = false;
        KeyEventListener.callbacks = [];
        return KeyEventListener;
    })();
    Plottable.KeyEventListener = KeyEventListener;
})(Plottable || (Plottable = {}));
