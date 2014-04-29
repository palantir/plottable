///<reference path="../reference.ts" />

module Plottable {
  export class RenderController {
    private static componentsNeedingRender: {[key: string]: Component} = {};
    private static animationRequested = false;
    public static enabled = (<any> window).PlottableTestCode == null && (window.requestAnimationFrame) != null;

    public static registerToRender(c: Component) {
      if (!Plottable.RenderController.enabled) {
        c._doRender();
        return;
      }
      RenderController.componentsNeedingRender[c._plottableID] = c;
      if (!RenderController.animationRequested) {
        requestAnimationFrame(RenderController.doRender);
        RenderController.animationRequested = true;
      }
    }

    public static doRender() {
      var components = d3.values(RenderController.componentsNeedingRender);
      components.forEach((c) => c._doRender());
      RenderController.componentsNeedingRender = {};
      RenderController.animationRequested = false;
    }
  }
}
