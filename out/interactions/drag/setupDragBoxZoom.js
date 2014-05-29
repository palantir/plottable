///<reference path="../../reference.ts" />
var Plottable;
(function (Plottable) {
    function setupDragBoxZoom(dragBox, xScale, yScale) {
        var xDomainOriginal = xScale.domain();
        var yDomainOriginal = yScale.domain();
        var resetOnNextClick = false;
        function callback(pixelArea) {
            if (pixelArea == null) {
                if (resetOnNextClick) {
                    xScale.domain(xDomainOriginal);
                    yScale.domain(yDomainOriginal);
                }
                resetOnNextClick = !resetOnNextClick;
                return;
            }
            resetOnNextClick = false;
            xScale.domain([xScale.invert(pixelArea.xMin), xScale.invert(pixelArea.xMax)]);
            yScale.domain([yScale.invert(pixelArea.yMax), yScale.invert(pixelArea.yMin)]);
            dragBox.clearBox();
            return;
        }
        dragBox.callback(callback);
    }
    Plottable.setupDragBoxZoom = setupDragBoxZoom;
})(Plottable || (Plottable = {}));
