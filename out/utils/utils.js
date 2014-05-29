///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    (function (Utils) {
        /**
        * Checks if x is between a and b.
        *
        * @param {number} x The value to test if in range
        * @param {number} a The beginning of the (inclusive) range
        * @param {number} b The ending of the (inclusive) range
        * @return {boolean} Whether x is in [a, b]
        */
        function inRange(x, a, b) {
            return (Math.min(a, b) <= x && x <= Math.max(a, b));
        }
        Utils.inRange = inRange;

        /**
        * Takes two arrays of numbers and adds them together
        *
        * @param {number[]} alist The first array of numbers
        * @param {number[]} blist The second array of numbers
        * @return {number[]} An array of numbers where x[i] = alist[i] + blist[i]
        */
        function addArrays(alist, blist) {
            return alist.map(function (_, i) {
                return alist[i] + blist[i];
            });
        }
        Utils.addArrays = addArrays;

        function accessorize(accessor) {
            if (typeof (accessor) === "function") {
                return accessor;
            } else if (typeof (accessor) === "string" && accessor[0] !== "#") {
                return function (d, i, s) {
                    return d[accessor];
                };
            } else {
                return function (d, i, s) {
                    return accessor;
                };
            }
            ;
        }
        Utils.accessorize = accessorize;

        function applyAccessor(accessor, dataSource) {
            var activatedAccessor = accessorize(accessor);
            return function (d, i) {
                return activatedAccessor(d, i, dataSource.metadata());
            };
        }
        Utils.applyAccessor = applyAccessor;

        function uniq(strings) {
            var seen = {};
            strings.forEach(function (s) {
                return seen[s] = true;
            });
            return d3.keys(seen);
        }
        Utils.uniq = uniq;

        /**
        * Creates an array of length `count`, filled with value or (if value is a function), value()
        *
        * @param {any} value The value to fill the array with, or, if a function, a generator for values
        * @param {number} count The length of the array to generate
        * @return {any[]}
        */
        function createFilledArray(value, count) {
            var out = [];
            for (var i = 0; i < count; i++) {
                out[i] = typeof (value) === "function" ? value(i) : value;
            }
            return out;
        }
        Utils.createFilledArray = createFilledArray;
    })(Plottable.Utils || (Plottable.Utils = {}));
    var Utils = Plottable.Utils;
})(Plottable || (Plottable = {}));
