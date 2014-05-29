///<reference path="../reference.ts" />
// This file contains open source utilities, along with their copyright notices
var Plottable;
(function (Plottable) {
    (function (OSUtils) {
        

        function sortedIndex(val, arr, accessor) {
            var low = 0;
            var high = arr.length;
            while (low < high) {
                /* tslint:disable:no-bitwise */
                var mid = (low + high) >>> 1;

                /* tslint:enable:no-bitwise */
                var x = accessor == null ? arr[mid] : accessor(arr[mid]);
                if (x < val) {
                    low = mid + 1;
                } else {
                    high = mid;
                }
            }
            return low;
        }
        OSUtils.sortedIndex = sortedIndex;
        ;
    })(Plottable.OSUtils || (Plottable.OSUtils = {}));
    var OSUtils = Plottable.OSUtils;
})(Plottable || (Plottable = {}));
