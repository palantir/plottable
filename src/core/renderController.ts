///<reference path="../reference.ts" />

module Plottable {
  export class RenderController {
    private static componentsNeedingRender: {[key: string]: Component} = {};
    private static componentsNeedingComputeLayout: {[key: string]: Component} = {};
    private static animationRequested = false;
    public static enabled = (<any> window).PlottableTestCode == null && (window.requestAnimationFrame) != null;

    public static registerToRender(c: Component) {
      if (!Plottable.RenderController.enabled) {
        c._doRender();
        return;
      }
      RenderController.componentsNeedingRender[c._plottableID] = c;
      RenderController.requestFrame();
    }

    public static registerToComputeLayout(c: Component) {
      if (!Plottable.RenderController.enabled) {
        c._computeLayout()._render();
        return;
      }
      RenderController.componentsNeedingComputeLayout[c._plottableID] = c;
      RenderController.componentsNeedingRender[c._plottableID] = c;
      RenderController.requestFrame();
    }

    private static requestFrame() {
      if (!RenderController.animationRequested) {
        requestAnimationFrame(RenderController.doRender);
        RenderController.animationRequested = true;
      }
    }

    public static doRender() {
      var toCompute = d3.values(RenderController.componentsNeedingComputeLayout);
      toCompute.forEach((c) => c._computeLayout());
      var toRender = d3.values(RenderController.componentsNeedingRender);
      toRender.forEach((c) => c._render()); // call _render on everything, so that containers will put their children in the toRender queue
      toRender = d3.values(RenderController.componentsNeedingRender);
      toRender.forEach((c) => c._doRender());
      RenderController.componentsNeedingComputeLayout = {};
      RenderController.componentsNeedingRender = {};
      RenderController.animationRequested = false;
    }
  }
}
