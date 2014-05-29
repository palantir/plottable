///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var PlottableObject = (function () {
        function PlottableObject() {
            this._plottableID = PlottableObject.nextID++;
        }
        PlottableObject.nextID = 0;
        return PlottableObject;
    })();
    Plottable.PlottableObject = PlottableObject;
})(Plottable || (Plottable = {}));
