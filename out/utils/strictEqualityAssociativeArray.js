///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    /**
    * An associative array that can be keyed by anything (inc objects).
    * Uses pointer equality checks which is why this works.
    * This power has a price: everything is linear time since it is actually backed by an array...
    */
    var StrictEqualityAssociativeArray = (function () {
        function StrictEqualityAssociativeArray() {
            this.keyValuePairs = [];
        }
        /**
        * Set a new key/value pair in the store.
        *
        * @param {any} Key to set in the store
        * @param {any} Value to set in the store
        * @return {boolean} True if key already in store, false otherwise
        */
        StrictEqualityAssociativeArray.prototype.set = function (key, value) {
            for (var i = 0; i < this.keyValuePairs.length; i++) {
                if (this.keyValuePairs[i][0] === key) {
                    this.keyValuePairs[i][1] = value;
                    return true;
                }
            }
            this.keyValuePairs.push([key, value]);
            return false;
        };

        StrictEqualityAssociativeArray.prototype.get = function (key) {
            for (var i = 0; i < this.keyValuePairs.length; i++) {
                if (this.keyValuePairs[i][0] === key) {
                    return this.keyValuePairs[i][1];
                }
            }
            return undefined;
        };

        StrictEqualityAssociativeArray.prototype.has = function (key) {
            for (var i = 0; i < this.keyValuePairs.length; i++) {
                if (this.keyValuePairs[i][0] === key) {
                    return true;
                }
            }
            return false;
        };

        StrictEqualityAssociativeArray.prototype.values = function () {
            return this.keyValuePairs.map(function (x) {
                return x[1];
            });
        };

        StrictEqualityAssociativeArray.prototype.delete = function (key) {
            for (var i = 0; i < this.keyValuePairs.length; i++) {
                if (this.keyValuePairs[i][0] === key) {
                    this.keyValuePairs.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        return StrictEqualityAssociativeArray;
    })();
    Plottable.StrictEqualityAssociativeArray = StrictEqualityAssociativeArray;
})(Plottable || (Plottable = {}));
