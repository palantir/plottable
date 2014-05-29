///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var RenderController = (function () {
        function RenderController() {
        }
        RenderController.registerToRender = function (c) {
            if (!Plottable.RenderController.enabled) {
                c._doRender();
                return;
            }
            RenderController.componentsNeedingRender[c._plottableID] = c;
            RenderController.requestFrame();
        };

        RenderController.registerToComputeLayout = function (c) {
            if (!Plottable.RenderController.enabled) {
                c._computeLayout()._render();
                return;
            }
            RenderController.componentsNeedingComputeLayout[c._plottableID] = c;
            RenderController.componentsNeedingRender[c._plottableID] = c;
            RenderController.requestFrame();
        };

        RenderController.requestFrame = function () {
            if (!RenderController.animationRequested) {
                requestAnimationFrame(RenderController.flush);
                RenderController.animationRequested = true;
            }
        };

        RenderController.flush = function () {
            if (RenderController.animationRequested) {
                var toCompute = d3.values(RenderController.componentsNeedingComputeLayout);
                toCompute.forEach(function (c) {
                    return c._computeLayout();
                });
                var toRender = d3.values(RenderController.componentsNeedingRender);

                // call _render on everything, so that containers will put their children in the toRender queue
                toRender.forEach(function (c) {
                    return c._render();
                });

                toRender = d3.values(RenderController.componentsNeedingRender);
                toRender.forEach(function (c) {
                    return c._doRender();
                });
                RenderController.componentsNeedingComputeLayout = {};
                RenderController.componentsNeedingRender = {};
                RenderController.animationRequested = false;
            }
        };
        RenderController.componentsNeedingRender = {};
        RenderController.componentsNeedingComputeLayout = {};
        RenderController.animationRequested = false;
        RenderController.enabled = window.PlottableTestCode == null && (window.requestAnimationFrame) != null;
        return RenderController;
    })();
    Plottable.RenderController = RenderController;
})(Plottable || (Plottable = {}));
