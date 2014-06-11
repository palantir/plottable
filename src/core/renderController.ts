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
        c._computeLayout()._render(); // TODO (bdwyer) - should this be _computeLayout()?
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

  /**
   * The ResizeBroadcaster will broadcast a notification to any registered
   * components when the window is resized.
   *
   * The broadcaster and single event listener are lazily constructed.
   *
   * Upon resize, the _resized flag will be set to true until after the next
   * flush of the RenderController. This is used, for example, to disable
   * animations during resize.
   */
  export class ResizeBroadcaster {
    private static _broadcaster: Abstract.Broadcaster;
    public static _resized: boolean = false;

    private static _lazyInitialize() {
      if (ResizeBroadcaster._broadcaster === undefined) {
        ResizeBroadcaster._broadcaster = new Abstract.Broadcaster();
        window.addEventListener("resize", ResizeBroadcaster._onResize);
      }
    }

    private static _onResize(){
      ResizeBroadcaster._resized = true;
      ResizeBroadcaster._broadcaster._broadcast();
    }

    /**
     * Registers a component.
     *
     * When the window is resized, we invoke ._invalidateLayout() on the
     * component, which will enqueue the component for layout and rendering
     * with the RenderController.
     *
     * @param {Abstract.Component} component Any Plottable component.
     */
    public static register(c: Abstract.Component) {
      ResizeBroadcaster._lazyInitialize();
      ResizeBroadcaster._broadcaster.registerListener(c._plottableID, () => c._invalidateLayout());
    }

    /**
     * Deregisters the components.
     *
     * The component will no longer receive updates on window resize.
     *
     * @param {Abstract.Component} component Any Plottable component.
     */
    public static deregister(c: Abstract.Component) {
      if (ResizeBroadcaster._broadcaster) {
        ResizeBroadcaster._broadcaster.deregisterListener(c._plottableID);
      }
    }
  }
}
}
