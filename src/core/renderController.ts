///<reference path="../reference.ts" />

module Plottable {
export module Singleton {

  /**
   * The RenderController is responsible for enqueueing and synchronizing
   * layout and render calls for Plottable components.
   *
   * Layouts and renders occur inside an animation callback
   * (window.requestAnimationFrame if available).
   *
   * If you require immediate rendering, call RenderController.flush() to
   * perform enqueued layout and rendering serially.
   */
  export class RenderController {
    private static IE_TIMEOUT = 1000 / 60; // 60 fps
    private static componentsNeedingRender: {[key: string]: Abstract.Component} = {};
    private static componentsNeedingComputeLayout: {[key: string]: Abstract.Component} = {};
    private static animationRequested = false;
    public static enabled = (<any> window).PlottableTestCode == null;

    /**
     * If the RenderController is enabled, we enqueue the component for
     * render. Otherwise, it is rendered immediately.
     *
     * @param {Abstract.Component} component Any Plottable component.
     */
    public static registerToRender(c: Abstract.Component) {
      if (!RenderController.enabled) {
        c._doRender();
        return;
      }
      RenderController.componentsNeedingRender[c._plottableID] = c;
      RenderController.requestFrame();
    }

    /**
     * If the RenderController is enabled, we enqueue the component for
     * layout and render. Otherwise, it is rendered immediately.
     *
     * @param {Abstract.Component} component Any Plottable component.
     */
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
        // Layout
        var toCompute = d3.values(RenderController.componentsNeedingComputeLayout);
        toCompute.forEach((c) => c._computeLayout());

        // Top level render.
        // Containers will put their children in the toRender queue
        var toRender = d3.values(RenderController.componentsNeedingRender);
        toRender.forEach((c) => c._render());

        // Finally, perform render of all components
        toRender = d3.values(RenderController.componentsNeedingRender);
        toRender.forEach((c) => c._doRender());

        // Reset queues
        RenderController.componentsNeedingComputeLayout = {};
        RenderController.componentsNeedingRender = {};
        RenderController.animationRequested = false;
      }

      // Reset resize flag regardless of queue'd components
      ResizeBroadcaster._resized = false;
    }
  }

}
}
