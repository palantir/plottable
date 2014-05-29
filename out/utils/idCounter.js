///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var IDCounter = (function () {
        function IDCounter() {
            this.counter = {};
        }
        IDCounter.prototype.setDefault = function (id) {
            if (this.counter[id] == null) {
                this.counter[id] = 0;
            }
        };

        IDCounter.prototype.increment = function (id) {
            this.setDefault(id);
            return ++this.counter[id];
        };

        IDCounter.prototype.decrement = function (id) {
            this.setDefault(id);
            return --this.counter[id];
        };

        IDCounter.prototype.get = function (id) {
            this.setDefault(id);
            return this.counter[id];
        };
        return IDCounter;
    })();
    Plottable.IDCounter = IDCounter;
})(Plottable || (Plottable = {}));
