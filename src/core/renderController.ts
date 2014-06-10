///<reference path="../reference.ts" />

module Plottable {
export module Singleton {
  export class ResizeBroadcaster {
    private static _broadcaster: Abstract.Broadcaster;

    private static _lazyInitialize() {
      if (ResizeBroadcaster._broadcaster === undefined) {
        ResizeBroadcaster._broadcaster = new Abstract.Broadcaster();
        window.addEventListener("resize", () => ResizeBroadcaster._broadcaster._broadcast());
      }
    }

    public static register(c: Abstract.Component) {
      ResizeBroadcaster._lazyInitialize();
      ResizeBroadcaster._broadcaster.registerListener(c._plottableID, () => c._invalidateLayout());
    }

    public static deregister(c: Abstract.Component) {
      if (ResizeBroadcaster._broadcaster) {
        ResizeBroadcaster._broadcaster.deregisterListener(c._plottableID);
      }
    }
  }

  export class RenderController {
    private static IE_TIMEOUT = 1000 / 60; // 60 fps
    private static componentsNeedingRender: {[key: string]: Abstract.Component} = {};
    private static componentsNeedingComputeLayout: {[key: string]: Abstract.Component} = {};
    private static animationRequested = false;
    public static enabled = (<any> window).PlottableTestCode == null;

    public static registerToRender(c: Abstract.Component) {
      if (!RenderController.enabled) {
        c._doRender();
        return;
      }
      RenderController.componentsNeedingRender[c._plottableID] = c;
      RenderController.requestFrame();
    }

    public static registerToComputeLayout(c: Abstract.Component) {
      if (!RenderController.enabled) {
        c._computeLayout()._render();
        return;
      }
      RenderController.componentsNeedingComputeLayout[c._plottableID] = c;
      RenderController.componentsNeedingRender[c._plottableID] = c;
      RenderController.requestFrame();
    }

    private static requestAnimationFramePolyfill(fn: () => any) {
        if (window.requestAnimationFrame != null) {
          requestAnimationFrame(fn);
        } else {
          setTimeout(fn, RenderController.IE_TIMEOUT);
        }
    }

    private static requestFrame() {
      if (!RenderController.animationRequested) {
        RenderController.requestAnimationFramePolyfill(RenderController.flush);
        RenderController.animationRequested = true;
      }
    }

    public static flush() {
      if (RenderController.animationRequested) {
        var toCompute = d3.values(RenderController.componentsNeedingComputeLayout);
        toCompute.forEach((c) => c._computeLayout());
        var toRender = d3.values(RenderController.componentsNeedingRender);
        // call _render on everything, so that containers will put their children in the toRender queue
        toRender.forEach((c) => c._render());

        toRender = d3.values(RenderController.componentsNeedingRender);
        toRender.forEach((c) => c._doRender());
        RenderController.componentsNeedingComputeLayout = {};
        RenderController.componentsNeedingRender = {};
        RenderController.animationRequested = false;
      }
    }
  }
}
}
