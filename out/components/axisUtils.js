///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    (function (AxisUtils) {
        AxisUtils.ONE_DAY = 24 * 60 * 60 * 1000;

        /**
        * Generates a relative date axis formatter.
        *
        * @param {number} baseValue The start date (as epoch time) used in computing relative dates
        * @param {number} increment The unit used in calculating relative date tick values
        * @param {string} label The label to append to tick values
        */
        function generateRelativeDateFormatter(baseValue, increment, label) {
            if (typeof increment === "undefined") { increment = AxisUtils.ONE_DAY; }
            if (typeof label === "undefined") { label = ""; }
            var formatter = function (tickValue) {
                var relativeDate = Math.round((tickValue.valueOf() - baseValue) / increment);
                return relativeDate.toString() + label;
            };
            return formatter;
        }
        AxisUtils.generateRelativeDateFormatter = generateRelativeDateFormatter;
    })(Plottable.AxisUtils || (Plottable.AxisUtils = {}));
    var AxisUtils = Plottable.AxisUtils;
})(Plottable || (Plottable = {}));
